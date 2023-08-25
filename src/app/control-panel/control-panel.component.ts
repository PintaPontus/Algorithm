import { Component } from '@angular/core';
import {AutomationController, Position} from "../../interfaces/automation-interfaces";
import {TauriInteractionsService} from "../tauri-interactions.service";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {

  private tauriService: TauriInteractionsService;
  public controller: AutomationController;
  public actualMouseCoords: Position = new Position();

  constructor(tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;
    this.controller = new AutomationController([], tauriService);
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
