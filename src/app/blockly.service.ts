import {inject, Service, signal} from '@angular/core';
import {Order} from 'blockly/lua';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {customBlocks} from '../interfaces/toolbox';
import * as It from 'blockly/msg/it';
import {Subject, Subscription} from 'rxjs';
import {PeripheralsService} from './peripherals.service';
import {JavascriptGenerator, javascriptGenerator} from 'blockly/javascript';
import {StorageService} from './storage.service';
import {MainToWorker, WorkerToMain} from '../interfaces/worker';

@Service()
export class BlocklyService {

  private readonly peripheralsService = inject(PeripheralsService);
  private readonly storageService = inject(StorageService);

  private readonly blocklyStartedSubject = new Subject<string|undefined>();
  readonly blocklyStarted = this.blocklyStartedSubject.asObservable();

  private readonly output = signal('');

  private listeners = new Subscription();
  private worker: Worker | undefined;

  constructor() {
    Blockly.setLocale(It as unknown as { [key: string]: string });
    Blockly.common.defineBlocks(customBlocks);
    this.setupGenerator();
  }

  async startId(id: string){
    const workspaceInfo = await this.storageService.getWorkspace(id);
    if(workspaceInfo?.state){
      const code = this.generateCodeFromState(workspaceInfo.state);
      this.startCode(id,code);
    }
  }

  startCode(id: string, code: string) {
    this.stopCode();
    this.output.set('');

    this.worker = new Worker(
      new URL('../worker/blockly.worker', import.meta.url),
      {type: 'module'},
    );
    const send = (message: MainToWorker) => this.worker?.postMessage(message);

    this.worker.onmessage = ({data}: MessageEvent<WorkerToMain>) => {
      switch (data.type) {
        case 'print':
          this.print(data.message);
          break;
        case 'log':
          this.writeLog(data.message, data.level);
          break;
        case 'pressKey':
          this.peripheralsService.emulate(data.key)
            .then(_ => this.writeLog(`Emulazione tasto: ${data.key}`))
            .catch(_ => this.writeLog(`Emulazione fallita: ${data.key}`));
          break;
        case 'moveCursor':
          this.peripheralsService.moveCursor(data.x, data.y)
            .then(_ => this.writeLog(`Movimento cursore: ${data.x}, ${data.y}`))
            .catch(_ => this.writeLog(`Movimento fallito: ${data.x}, ${data.y}`));
          break;
      }
    };

    // Errori non gestiti (es. sintassi del codice generato)
    this.worker.onerror = (event) => {
      event.preventDefault();
      this.writeLog(event.message, 'error');
    };

    // Inoltra i tasti al worker finché lo script è attivo
    this.listeners.add(
      this.peripheralsService.keyPressed.subscribe(
        (key) => send({type: 'onKey', key})
      )
    );

    send({type: 'onStart', code});
    this.blocklyStartedSubject.next(id);
  }

  stopCode(){
    this.worker?.terminate();
    this.worker = undefined;
    this.listeners.unsubscribe();
    this.listeners = new Subscription();
    this.blocklyStartedSubject.next(undefined);
  }

  getOutput() {
    return this.output.asReadonly();
  }

  private setupGenerator(){
    javascriptGenerator.forBlock['text_print'] = function (block: any, generator: JavascriptGenerator) {
      const msg = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      return `print(${msg});\n`;
    };

    javascriptGenerator.forBlock['press_key'] = function (block: any, generator: JavascriptGenerator) {
      const msg = generator.valueToCode(block, 'KEY', Order.NONE) || "''";
      return `pressKey(${msg});\n`;
    };

    javascriptGenerator.forBlock['mkb_key'] = function (block: any) {
      const value = block.getFieldValue('VALUE');
      return [JSON.stringify(value), Order.ATOMIC];
    };

    javascriptGenerator.forBlock['move_cursor'] = function (block: any, generator: JavascriptGenerator) {
      const x = generator.valueToCode(block, 'X', Order.NONE) || "0";
      const y = generator.valueToCode(block, 'Y', Order.NONE) || "0";
      return `moveCursor(${x}, ${y});\n`;
    };

    javascriptGenerator.forBlock['on_start'] = function (block: any, generator: JavascriptGenerator) {
      const body = generator.statementToCode(block, 'DO');
      return `onStart(async () => {\n${body}});\n`;
    };

    javascriptGenerator.forBlock['on_key'] = function (block: any, generator: JavascriptGenerator) {
      const key = generator.valueToCode(block, 'KEY', Order.NONE) || "''";
      const body = generator.statementToCode(block, 'DO');
      return `onKey(${key}, async () => {\n${body}});\n`;
    };

    javascriptGenerator.forBlock['await'] = function (block: any, generator: JavascriptGenerator) {
      const value = generator.valueToCode(block, 'AMOUNT', Order.NONE) || '0';
      return `await new Promise((resolve) => setTimeout(resolve, ${Number(value)*1000}));\n`;
    };

    javascriptGenerator.forBlock['await_ms'] = function (block: any, generator: JavascriptGenerator) {
      const value = generator.valueToCode(block, 'AMOUNT', Order.NONE) || '0';
      return `await new Promise((resolve) => setTimeout(resolve, ${value}));\n`;
    };
  }

  private generateCodeFromState(state: {[key: string]: any}): string {
    const headless = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load(state, headless);
      return javascriptGenerator.workspaceToCode(headless);
    } finally {
      headless.dispose();
    }
  }

  private print(msg: any){
    this.output.update(lines => `${lines}${msg}\n`);
  }

  private writeLog(msg: any, level: 'info' | 'error' = 'info'){
    this.print(`[${level}]: ${msg}`);
  }

}
