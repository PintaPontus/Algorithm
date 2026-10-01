import {inject, Service, signal} from '@angular/core';
import {Order} from 'blockly/lua';
import {CodeGenerator} from 'blockly';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {customBlocks} from '../interfaces/toolbox';
import * as It from 'blockly/msg/it';
import {filter, Subject, Subscription} from 'rxjs';
import {PeripheralsService} from './peripherals.service';

@Service()
export class BlocklyService {

  private readonly peripheralsService = inject(PeripheralsService);

  private readonly blocklyStartedSubject = new Subject<void>();
  readonly blocklyStarted = this.blocklyStartedSubject.asObservable();

  readonly output = signal('');

  private listeners = new Subscription();

  constructor() {
    Blockly.setLocale(It as unknown as { [key: string]: string });
    Blockly.common.defineBlocks(customBlocks);
  }

  start(code: string) {
    this.clearListeners();
    try {
      new Function(
        'onStart',
        'onKey',
        'print',
        'pressKey',
        'moveCursor',
        code
      )(
        (callback: () => void) => {
          this.listeners.add(
            this.blocklyStarted
              .subscribe(() => {
                this.writeLog(`Programma avviato!`);
                callback();
              })
          );
        },
        (key: string, callback: () => void) => {
          this.listeners.add(
            this.peripheralsService.keyPressed
              .pipe(filter((pressed) => pressed === key))
              .subscribe((value) => {
                this.writeLog(`Input tasto: ${value}`);
                callback();
              })
          );
        },
        (msg: unknown) => {
          this.writeLog(msg);
        },
        (msg: unknown) => {
          this.peripheralsService.emulate(String(msg))
            .then(_ => this.writeLog(`Emulazione tasto: ${msg}`))
            .catch(_ => this.writeLog(`Emulazione fallita: ${msg}`));
        },
        (x: unknown, y: unknown) => {
          this.peripheralsService.moveCursor(Number(x), Number(y))
            .then(_ => this.writeLog(`Movimento cursore: ${x}, ${y}`))
            .catch(_ => this.writeLog(`Movimento fallito: ${x}, ${y}`));
        },
      );
    } catch (error) {
      this.writeLog(error, 'error');
    }
    this.blocklyStartedSubject.next();
  }

  setupGenerator(javascriptGenerator: any){
    javascriptGenerator.forBlock['text_print'] = function (block: any, generator: CodeGenerator) {
      const msg = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      return `print(${msg});\n`;
    };

    javascriptGenerator.forBlock['press_key'] = function (block: any, generator: CodeGenerator) {
      const msg = generator.valueToCode(block, 'KEY', Order.NONE) || "''";
      return `pressKey(${msg});\n`;
    };

    javascriptGenerator.forBlock['mkb_key'] = function (block: any) {
      const value = block.getFieldValue('VALUE');
      return [JSON.stringify(value), Order.ATOMIC];
    };

    javascriptGenerator.forBlock['move_cursor'] = function (block: any, generator: CodeGenerator) {
      const x = generator.valueToCode(block, 'X', Order.NONE) || "0";
      const y = generator.valueToCode(block, 'Y', Order.NONE) || "0";
      return `moveCursor(${x}, ${y});\n`;
    };

    javascriptGenerator.forBlock['on_start'] = function (block: any, generator: CodeGenerator) {
      const body = generator.statementToCode(block, 'DO');
      return `onStart(async () => {\n${body}});\n`;
    };

    javascriptGenerator.forBlock['on_key'] = function (block: any, generator: CodeGenerator) {
      const key = generator.valueToCode(block, 'KEY', Order.NONE) || "''";
      const body = generator.statementToCode(block, 'DO');
      return `onKey(${key}, async () => {\n${body}});\n`;
    };

    javascriptGenerator.forBlock['await'] = function (block: any, generator: CodeGenerator) {
      const value = generator.valueToCode(block, 'AMOUNT', Order.NONE) || '0';
      return `await new Promise((resolve) => setTimeout(resolve, ${Number(value)*1000}));\n`;
    };

    javascriptGenerator.forBlock['await_ms'] = function (block: any, generator: CodeGenerator) {
      const value = generator.valueToCode(block, 'AMOUNT', Order.NONE) || '0';
      return `await new Promise((resolve) => setTimeout(resolve, ${value}));\n`;
    };
  }

  clearListeners() {
    this.listeners.unsubscribe();
    this.listeners = new Subscription();
  }

  writeLog(msg: any, type: 'info' | 'error' = 'info'){
    this.output.update(lines => `${lines}[${type}]: ${msg}\n`);
  }
}
