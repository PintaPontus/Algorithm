import { Component } from '@angular/core';
import {AutomationItem, AutomationController} from "../../interfaces/automation-interfaces";
import {TauriInteractionsService} from "../tauri-interactions.service";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {

  public controller: AutomationController;

  public actionsList: AutomationItem[];
  constructor(tauriService: TauriInteractionsService) {
    // TODO: remove example actions
    this.actionsList = [new AutomationItem(), new AutomationItem(), new AutomationItem()];
    this.controller = new AutomationController(this.actionsList, tauriService);
  }

}
