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

  workspaceState: object | undefined;

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
        code
      )(
        (callback: () => void) => {
          this.listeners.add(
            this.blocklyStarted
              .subscribe(() => {
                this.writeLog(`Programma startato!`);
                callback();
              })
          );
        },
        (key: string, callback: () => void) => {
          this.listeners.add(
            this.peripheralsService.keyPressed
              .pipe(filter((pressed) => pressed === key))
              .subscribe((value) => {
                this.writeLog(`Tasto premuto: ${value}`);
                callback();
              })
          );
        },
        (msg: unknown) => {
          this.writeLog(msg);
        },
        (msg: unknown) => {
          this.writeLog(`Mouse e Tastiera: ${msg}`);
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

    javascriptGenerator.forBlock['move_cursor'] = function (block: any) {
      const value = block.getFieldValue('VALUE');
      return [JSON.stringify(value), Order.ATOMIC];
    };

    javascriptGenerator.forBlock['on_start'] = function (block: any, generator: CodeGenerator) {
      const body = generator.statementToCode(block, 'DO');
      return `onStart(() => {\n${body}});\n`;
    };

    // Registra un listener che resta in attesa dell'evento
    javascriptGenerator.forBlock['on_key'] = function (block: any, generator: CodeGenerator) {
      const key = generator.valueToCode(block, 'KEY', Order.NONE) || "''";
      const body = generator.statementToCode(block, 'DO');
      return `onKey(${key}, () => {\n${body}});\n`;
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
