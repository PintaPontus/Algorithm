import {
  afterRenderEffect,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';

import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';

import {toolbox} from '../../interfaces/toolbox';
import {BlocklyService} from '../blockly.service';
import {FormsModule} from '@angular/forms';

@Component({
  imports: [
    FormsModule
  ],
  selector: 'app-block-workspace',
  styleUrl: './block-workspace.css',
  templateUrl: './block-workspace.html',
})
export class BlockWorkspace {
  private readonly blocklyService = inject(BlocklyService);

  readonly blocklyDiv = viewChild<ElementRef<HTMLDivElement>>('blocklyDiv');
  readonly code = signal('');
  readonly output = this.blocklyService.output;

  private workspace: Blockly.WorkspaceSvg | undefined;

  constructor() {
    afterRenderEffect(() => {
      const divEl = this.blocklyDiv()?.nativeElement
      if(divEl){

        this.workspace = Blockly.inject(divEl, {
          toolbox,
        });
        this.blocklyService.setupGenerator(javascriptGenerator);

        const saved = this.blocklyService.workspaceState;
        if (saved) {
          Blockly.serialization.workspaces.load(saved, this.workspace);
        }
        this.code.set(javascriptGenerator.workspaceToCode(this.workspace));

        const supportedEvents = new Set([
          Blockly.Events.BLOCK_CHANGE,
          Blockly.Events.BLOCK_CREATE,
          Blockly.Events.BLOCK_DELETE,
          Blockly.Events.BLOCK_MOVE,
        ] as string[]);

        this.workspace.addChangeListener((event)=> {
          if (this.workspace?.isDragging() ?? true) return; // Don't update while changes are happening.
          if (!supportedEvents.has(event.type)) return;

          const code = javascriptGenerator.workspaceToCode(this.workspace);
          this.code.set(code);
          this.blocklyService.workspaceState = Blockly.serialization.workspaces.save(this.workspace!);
        });
      }
    });

    inject(DestroyRef).onDestroy(() => {
      if(this.workspace){
        this.blocklyService.workspaceState = Blockly.serialization.workspaces.save(this.workspace);
        this.workspace.dispose();
        this.workspace = undefined;
      }
    });
  }

  runCode()  {
    this.blocklyService.start(this.code());
  };


}
