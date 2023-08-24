import { Component } from '@angular/core';
import {AutomationItem, AutomationController} from "../../interfaces/automation-interfaces";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {

  public controller: AutomationController;

  public actionsList: AutomationItem[];
  constructor() {
    // TODO: remove example actions
    this.actionsList = [new AutomationItem(), new AutomationItem(), new AutomationItem()];
    this.controller = new AutomationController(this.actionsList);
  }

}
