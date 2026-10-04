import {Component, inject, resource, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatCard, MatCardActions, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatFabButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {StorageService} from '../storage.service';
import {BlocklyService} from '../blockly.service';
import {WorkspaceInfo} from '../../interfaces/workspace';

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
    RouterLink
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly blocklyService = inject(BlocklyService);
  private readonly storageService = inject(StorageService);

  readonly textSearch = signal('');
  readonly playingScript = signal<string|undefined>(undefined);

  readonly scriptList = resource({
    loader: ()=>{
      return this.storageService.getAllWorkspaces();
    },
    defaultValue: []
  });

  async playWorkspace(workspaceId: string) {
    await this.blocklyService.startId(workspaceId);
    this.playingScript.set(workspaceId);
  }

  async stopAll() {
    this.blocklyService.stopCode();
    this.playingScript.set(undefined);
  }

  async deleteWorkspace(workspaceId: string) {
    await this.storageService.deleteWorkspace(workspaceId);
    this.scriptList.reload();
  }

  async export(info: WorkspaceInfo){
    await this.storageService.exportWorkspace(info);
  }

  async import(){
    await this.storageService.importWorkspace();
    this.scriptList.reload();
  }

  protected readonly Array = Array;
  protected readonly crypto = crypto;
}
