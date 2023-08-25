import { Component } from '@angular/core';
import {AutomationItem, AutomationController, Position} from "../../interfaces/automation-interfaces";
import {TauriInteractionsService} from "../tauri-interactions.service";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {

  private tauriService: TauriInteractionsService;
  public controller: AutomationController;
  public actionsList: AutomationItem[];
  public actualMouseCoords: Position = new Position();

  constructor(tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;
    this.actionsList = [];
    this.controller = new AutomationController(this.actionsList, tauriService);
    this.updateMouseCoords();
  }

  async updateMouseCoords(){
    setInterval(()=>{
      this.tauriService.retrieveCoords().then(coords => {
        this.actualMouseCoords.x = coords.x;
        this.actualMouseCoords.y = coords.y;
      });
    }, 200);
  }
}
