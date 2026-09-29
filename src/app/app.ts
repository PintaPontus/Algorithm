import {afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Import Blockly core.
import * as Blockly from 'blockly/core';
import {toolbox} from '../interfaces/toolbox';
import {customBlocks} from '../interfaces/toolbox';
import 'blockly/blocks';
import * as It from 'blockly/msg/it';
import {javascriptGenerator} from 'blockly/javascript';
import {Order} from 'blockly/lua';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {

  readonly blocklyDiv = viewChild<ElementRef<HTMLDivElement>>('blocklyDiv')
  readonly code = signal('')
  readonly output = signal('')

  private workspace?: Blockly.WorkspaceSvg;

  constructor() {
    Blockly.setLocale(It as unknown as { [key: string]: string });

    afterNextRender(() => {
      const divEl = this.blocklyDiv()?.nativeElement
      if(divEl){
        Blockly.common.defineBlocks(customBlocks);
        this.workspace = Blockly.inject(divEl, {
          toolbox,
        });
      }
    });

    inject(DestroyRef).onDestroy(() => this.workspace?.dispose());
  }

  runCode()  {
    javascriptGenerator.forBlock['text_print'] = function (block, generator) {
      const msg = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      return `print(${msg});\n`;
    };

    javascriptGenerator.forBlock['press_key'] = function (block, generator) {
      const msg = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      return `pressKey(${msg});\n`;
    };

    const code = javascriptGenerator.workspaceToCode(this.workspace);
    this.code.set(code);
    this.output.set(code);

    const lines: string[] = [];

    // Wrap `eval` in a `try/catch` so that any runtime errors are
    // logged to the console, instead of failing quietly.
    try {
      new Function('print', 'pressKey', code)(
        (msg: unknown) => {
          lines.push(String(msg));
        },
        (msg: unknown) => {
          lines.push(String(`Tastiera: ${msg}`));
        }
      );
    } catch (error) {
      lines.push(String(error));
    }
    this.output.set(lines.join('\n'));
  };

}
