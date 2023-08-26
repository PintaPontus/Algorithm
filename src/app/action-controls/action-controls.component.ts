import {Component, Input} from '@angular/core';
import {AutomationController, Position} from "../../interfaces/automation-interfaces";

@Component({
  selector: 'action-controls',
  templateUrl: './action-controls.component.html',
  styleUrls: ['./action-controls.component.scss']
})
export class ActionControlsComponent {
  @Input()
  public controller: AutomationController | undefined;
  @Input()
  public actualMouseCoords: Position = new Position();
  public importDialogOpen: boolean = false;
  public exportDialogOpen: boolean = false;
  public importText: string = '';
  public exportText: string = '';

  importActions(){
    this.controller?.import(this.importText);
    this.closeImportDialog();
  }

  copyActions(){
    navigator.clipboard.writeText(this.exportText)
      .then(()=>{
        console.log(this.exportText);
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
    this.exportText = this.controller?.export() || '';
    this.exportDialogOpen = true;
  }

  closeExportDialog() {
    this.exportDialogOpen = false;
  }
}
