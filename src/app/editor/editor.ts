import {
  afterRenderEffect,
  Component, computed,
  DestroyRef,
  ElementRef,
  inject, Signal,
  signal,
  viewChild
} from '@angular/core';

import * as Blockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';

import {toolbox} from '../../interfaces/toolbox';
import {BlocklyService} from '../blockly.service';
import {FormsModule} from '@angular/forms';
import {StorageService} from '../storage.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {PeripheralsService} from '../peripherals.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {WorkspaceInfo} from '../../interfaces/workspace';
import {MatButton, MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {CursorCoordinates, FormattedCursorCoordinates} from '../../interfaces/peripherals';
import {MatDivider} from '@angular/material/list';

@Component({
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    RouterLink,
    MatFabButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatDivider
  ],
  selector: 'app-editor',
  styleUrl: './editor.css',
  templateUrl: './editor.html',
})
export class Editor {
  private readonly blocklyService = inject(BlocklyService);
  private readonly peripheralsService = inject(PeripheralsService);
  private readonly storageService = inject(StorageService);

  readonly route = inject(ActivatedRoute);
  readonly routeParamMap = toSignal(this.route.paramMap);
  readonly blocklyDiv = viewChild<ElementRef<HTMLDivElement>>('blocklyDiv');

  readonly id = computed(() => this.routeParamMap()?.get('id') ?? null);
  private workspaceInfo: WorkspaceInfo | undefined = undefined;
  readonly title = signal<string>('');
  readonly description = signal<string>('');

  readonly blocklyRunning = toSignal(this.blocklyService.blocklyStarted);
  readonly isRunning = computed(() => this.blocklyRunning() === this.id());

  readonly showOutput = signal(false);
  readonly code = signal('');
  readonly output = this.blocklyService.getOutput();

  readonly cursorCoordinates: Signal<CursorCoordinates> = this.peripheralsService.getCursorCoordinates();
  readonly formattedCoordinates: Signal<FormattedCursorCoordinates> = computed(() => ({
    x:String(this.cursorCoordinates().x).padStart(4, '0'),
    y:String(this.cursorCoordinates().y).padStart(4, '0'),
  }));
  readonly keyPressed = toSignal(this.peripheralsService.keyPressed);

  private workspace: Blockly.WorkspaceSvg | undefined;

  constructor() {
    afterRenderEffect(async () => {
      await this.clearWorkspace();
      if(this.id()){
        this.workspaceInfo = await this.storageService.getWorkspace(this.id()!);
        this.title.set(this.workspaceInfo?.title ?? this.id()!);
        this.description.set(this.workspaceInfo?.description ?? '');
      }

      const divEl = this.blocklyDiv()?.nativeElement;
      if(divEl){
        this.workspace = Blockly.inject(divEl, {
          toolbox,
          theme: DarkTheme
        });

        if (this.workspaceInfo?.state) {
          Blockly.serialization.workspaces.load(this.workspaceInfo.state, this.workspace);
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
          this.saveState();
        });
      }
    });

    inject(DestroyRef).onDestroy(async () => {
      await this.clearWorkspace(true);
    });
  }

  runCode()  {
    this.blocklyService.startCode(this.id()!, this.code());
  };

  stopCode()  {
    this.blocklyService.stopCode();
  };

  toggleOutput(){
    this.showOutput.set(!this.showOutput());
    if (this.workspace) {
      requestAnimationFrame(() => {
        Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);
      });
    }
  }

  async saveState(flush: boolean = false){
    if(this.id()){
      await this.storageService.setWorkspace(
        this.id()!,
        this.generateWorkspaceInfo(),
      );
    }
    if(flush){
      await this.storageService.flushWorkspace();
    }
  }

  async export(){
    const info = this.generateWorkspaceInfo();
    await this.storageService.exportWorkspace(info);
  }

  private generateWorkspaceInfo(): WorkspaceInfo {
    return {
      id: this.id()!,
      title: this.title(),
      description: this.description(),
      lastUpdated: Date.now(),
      state: this.workspace ? Blockly.serialization.workspaces.save(this.workspace!) : undefined,
    }
  }

  private async clearWorkspace(save: boolean = false){
    if(this.workspace){
      if(save){
        await this.saveState(true);
      }
      this.workspace.dispose();
      this.workspace = undefined;
    }
  }

  protected readonly String = String;
}
