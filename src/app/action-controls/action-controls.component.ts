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
  public showTimer: boolean = false;
  public startTime: string | undefined;
  public stopTime: string | undefined;
  public minDate: string | undefined;

  constructor(controller: AutomationService,tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;
    this.controller = controller;
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

  openTimer() {
    this.minDate = new Date().toISOString();
    this.minDate = this.minDate.substring(0, this.minDate.indexOf('.'));
    this.tauriService.log_rust(this.minDate);
    this.showTimer = true;
  }

  closeTimerDialog() {
    this.showTimer = false;
    this.stopTime = undefined;
    this.startTime = undefined;
  }

  setTimer() {
    this.controller.setStartTimer(this.startTime ? new Date(String(this.startTime)) : undefined);
    this.controller.setStopTimer(this.stopTime ? new Date(String(this.stopTime)) : undefined);
    this.closeTimerDialog();
  }

}
