import {inject, Service, signal} from '@angular/core';
import {Order} from 'blockly/lua';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {customBlocks} from '../interfaces/toolbox';
import * as It from 'blockly/msg/it';
import {Subscription} from 'rxjs';
import {PeripheralsService} from './peripherals.service';
import {JavascriptGenerator, javascriptGenerator} from 'blockly/javascript';
import {MainToWorker, WorkerToMain} from '../interfaces/worker';
import {WorkspaceInfo} from '../interfaces/workspace';

@Service()
export class BlocklyService {

  private readonly peripheralsService = inject(PeripheralsService);

  private readonly playingScripts = signal<Set<string>>(new Set());

  private readonly output = signal('');

  private listenersMap: Map<string, Subscription> = new Map();
  private workerMap: Map<string, Worker> = new Map();

  constructor() {
    Blockly.setLocale(It as unknown as { [key: string]: string });
    Blockly.common.defineBlocks(customBlocks);
    this.setupGenerator();
  }

  async start(info: WorkspaceInfo){
    if(info?.state){
      const code = this.generateCodeFromState(info.state);
      this.startCode(info,code);
    }
  }

  startCode(info: WorkspaceInfo, code: string) {
    this.stop(info, 'silent');

    this.workerMap.set(
      info.id,
      new Worker(
      new URL('../worker/blockly.worker', import.meta.url),
        {type: 'module'},
      )
    );
    const send = (message: MainToWorker) => this.workerMap.get(info.id)?.postMessage(message);

    this.workerMap.get(info.id)!.onmessage = ({data}: MessageEvent<WorkerToMain>) => {
      switch (data.type) {
        case 'stop':
          this.stop(info, 'finish');
          break;
        case 'abort':
          this.stop(info, 'abort');
          break;
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
    this.workerMap.get(info.id)!.onerror = (event) => {
      event.preventDefault();
      this.writeLog(event.message, 'error');
    };

    this.listenersMap.set(info.id, new Subscription());
    this.listenersMap.get(info.id)?.add(
      this.peripheralsService.keyPressed.subscribe(
        (key) => send({type: 'onKey', key})
      )
    );

    send({type: 'onStart', code});
    this.writeLog(`Avviato '${info.title}'`)
    this.playingScripts.update(set => {
      const newSet = new Set(set.values());
      newSet.add(info.id);
      return newSet;
    });
  }

  stop(info: WorkspaceInfo, mode: 'finish' | 'interrupt' | 'silent' | 'abort' = 'interrupt'){
    this.listenersMap.get(info.id)?.unsubscribe();
    this.listenersMap.delete(info.id);
    this.workerMap.get(info.id)?.terminate();
    this.workerMap.delete(info.id);
    this.playingScripts.update(set => {
      const newSet = new Set(set);
      newSet.delete(info.id);
      return newSet;
    });
    switch(mode){
      case 'finish':
        this.writeLog(`Terminato '${info.title}'`);
        break;
      case 'interrupt':
        this.writeLog(`Interrotto '${info.title}'`);
        break;
      case 'abort':
        this.writeLog(`Abortito '${info.title}'`);
        break;
    }
  }

  stopAll(){
    this.listenersMap.forEach(list=> list.unsubscribe());
    this.listenersMap.clear();
    this.workerMap.forEach(list=> list.terminate());
    this.workerMap.clear();
    this.playingScripts.set(new Set());
    this.writeLog(`Interrotti tutti gli script`);
  }

  getOutput() {
    return this.output.asReadonly();
  }

  clearOutput() {
    return this.output.set('');
  }

  getPlayingScripts() {
    return this.playingScripts.asReadonly();
  }

  private setupGenerator(){
    javascriptGenerator.forBlock['console_print'] = function (block: any, generator: JavascriptGenerator) {
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

    javascriptGenerator.forBlock['abort'] = function () {
      return `abort();\n`;
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
