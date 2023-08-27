import {Component, Input} from '@angular/core';
import {Position} from "../../interfaces/automation-interfaces";
import {AutomationService} from "../automation.service";
import {TauriInteractionsService} from "../tauri-interactions.service";
import {open, save} from '@tauri-apps/api/dialog';

@Component({
  selector: 'action-controls',
  templateUrl: './action-controls.component.html',
  styleUrls: ['./action-controls.component.scss']
})
export class ActionControlsComponent {
  public controller: AutomationService;
  public tauriService: TauriInteractionsService;
  @Input()
  public actualMouseCoords: Position = new Position();
  public importDialogOpen: boolean = false;
  public exportDialogOpen: boolean = false;
  public importText: string = '';
  public exportText: string = '';

  constructor(controller: AutomationService,tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;
    this.controller = controller;
  }

  importActions(){
    this.controller.import(this.importText);
    this.closeDialogs();
  }

  copyActions(){
    navigator.clipboard.writeText(this.exportText)
      .then(()=>{
        this.closeDialogs();
      })
  }

  async saveActions(){
    const selected = await save({
      defaultPath: this.controller.CURRENT_DIR,
      filters: [{
        name: 'JSON',
        extensions: ['json']
      }]
    });
    if (selected !== null) {
      this.controller.saveActions(String(selected));
    }
  }

  async openActions(){
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'JSON',
        extensions: ['json']
      }],
      defaultPath: this.controller.CURRENT_DIR,
    });
    if(selected !== null){
      this.controller.openActions(String(selected));
    }
  }

  openImportDialog() {
    this.closeDialogs();
    this.importText = '';
    this.importDialogOpen = true;
  }

  openExportDialog() {
    this.closeDialogs();
    this.exportText = this.controller.export() || '';
    this.exportDialogOpen = true;
  }

  closeDialogs() {
    this.importDialogOpen = false;
    this.exportDialogOpen = false;
  }
}
