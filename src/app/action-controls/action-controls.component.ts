import {Component, Input} from '@angular/core';
import {Position} from "../../interfaces/automation-interfaces";
import {AutomationService} from "../automation.service";

@Component({
  selector: 'action-controls',
  templateUrl: './action-controls.component.html',
  styleUrls: ['./action-controls.component.scss']
})
export class ActionControlsComponent {
  public controller: AutomationService;
  @Input()
  public actualMouseCoords: Position = new Position();
  public importDialogOpen: boolean = false;
  public exportDialogOpen: boolean = false;
  public importText: string = '';
  public exportText: string = '';

  constructor(controller: AutomationService) {
    this.controller = controller;
  }

  importActions(){
    this.controller.import(this.importText);
    this.closeImportDialog();
  }

  copyActions(){
    navigator.clipboard.writeText(this.exportText)
      .then(()=>{
        this.closeExportDialog();
      })
  }

  openImportDialog() {
    this.importText = '';
    this.importDialogOpen = true;
  }

  closeImportDialog() {
    this.importDialogOpen = false;
  }

  openExportDialog() {
    this.exportText = this.controller.export() || '';
    this.exportDialogOpen = true;
  }

  closeExportDialog() {
    this.exportDialogOpen = false;
  }
}
