import { Injectable } from '@angular/core';
import {TauriInteractionsService} from "./tauri-interactions.service";
import {AutomationItem, AutomationType} from "../interfaces/automation-interfaces";

@Injectable({
  providedIn: 'root'
})
export class AutomationService {

  private stopped: boolean = true;
  private executing: boolean = false;
  public actionsList: AutomationItem[] = [];
  private tauriService: TauriInteractionsService;
  constructor(tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;
  }

  async automation_loop(){
    let actualItem: AutomationItem;
    let previousItem: AutomationItem | undefined;
    for(let i = 0; !this.stopped && this.actionsList.length > 0; i=(i+1)%this.actionsList.length){
      while(!this.executing){
        await new Promise(f => setTimeout(f, 1000));
      }

      if(previousItem){
        previousItem.active = false;
      }
      actualItem = this.actionsList[i];
      actualItem.active = true;

      switch (actualItem.type){
        case AutomationType.WAIT:
          await new Promise(f => setTimeout(f, actualItem.duration));
          break;
        case AutomationType.CLICK_MOUSE:
          await this.tauriService.click();
          break;
        case AutomationType.MOVE_MOUSE:
          await this.tauriService.move(actualItem.position.x, actualItem.position.y);
          break;
      }
      previousItem = actualItem;
    }
    if(previousItem){
      previousItem.active = false;
    }
  }

  play() {
    this.executing=true;
    if(this.stopped){
      this.stopped=false;
      this.automation_loop();
    }
  }

  pause() {
    this.executing=false;
  }

  stop() {
    this.stopped=true;
    this.executing=false;
  }

  add() {
    this.actionsList.push(new AutomationItem())
  }

  import(json: string){
    this.actionsList = JSON.parse(json);
  }

  export(){
    return JSON.stringify(this.actionsList);
  }
}
