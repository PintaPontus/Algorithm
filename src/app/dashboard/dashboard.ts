import {Component, computed, inject, resource, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatCard, MatCardActions, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatFabButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {StorageService} from '../storage.service';
import {BlocklyService} from '../blockly.service';
import {WorkspaceInfo} from '../../interfaces/workspace';
import {MatTooltip} from '@angular/material/tooltip';
import {Console} from '../console/console';

@Component({
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatMiniFabButton,
    MatIcon,
    MatFabButton,
    RouterLink,
    MatLabel,
    MatTooltip,
    Console
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly blocklyService = inject(BlocklyService);
  private readonly storageService = inject(StorageService);

  readonly textSearch = signal('');
  readonly playingScript = this.blocklyService.getPlayingScripts();

  readonly showOutput = signal(false);

  readonly scriptList = resource({
    loader: ()=>{
      return this.storageService.getAllWorkspaces();
    },
    defaultValue: []
  });

  readonly filteredScriptList = computed(()=>{
    return this.scriptList.value().filter((script)=>{
      return script.title.toLowerCase().includes(this.textSearch().toLowerCase());
    }).sort((a, b) => a.title.localeCompare(b.title));
  })

  async playWorkspace(workspaceInfo: WorkspaceInfo) {
    await this.blocklyService.start(workspaceInfo);
  }

  async stopWorkspace(workspaceInfo: WorkspaceInfo) {
    this.blocklyService.stop(workspaceInfo);
  }

  async stopAll() {
    this.blocklyService.stopAll();
  }

  async deleteWorkspace(workspaceId: string) {
    await this.storageService.deleteWorkspace(workspaceId);
    this.scriptList.reload();
  }

  async duplicate(info: WorkspaceInfo){
    await this.storageService.duplicateWorkspace({...info, title: `${info.title} (copia)`});
    this.scriptList.reload();
  }

  async export(info: WorkspaceInfo){
    await this.storageService.exportWorkspace(info);
  }

  async import(){
    await this.storageService.importWorkspace();
    this.scriptList.reload();
  }

  async debug(){
    await this.storageService.print();
  }

  toggleOutput(){
    this.showOutput.set(!this.showOutput());
  }

  protected readonly Array = Array;
  protected readonly crypto = crypto;
}
