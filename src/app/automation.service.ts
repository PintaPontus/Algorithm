import { Injectable } from '@angular/core';
import {TauriInteractionsService} from "./tauri-interactions.service";
import {AutomationItem, AutomationType} from "../interfaces/automation-interfaces";
import {appConfigDir} from "@tauri-apps/api/path";

@Injectable({
  providedIn: 'root'
})
export class AutomationService {

  private tauriService: TauriInteractionsService;
  public actionsList: AutomationItem[] = [];
  private stopped: boolean = true;
  private executing: boolean = false;
  public delay: number = 100;
  private readonly SETTINGS_FILE_NAME: string = ".algorithm-actions.json";
  public CURRENT_DIR: string = "";
  constructor(tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;

    this.initSettings();
  }

  private async initSettings(){
    await this.setPaths();
    await this.openActions(await appConfigDir() + this.SETTINGS_FILE_NAME);
  }

  private async setPaths(){
    this.CURRENT_DIR = await this.tauriService.getCurrentDir();
  }

  async automation_loop(){
    let actualItem: AutomationItem;
    let previousItem: AutomationItem | undefined;
    for(let i = 0; !this.stopped && this.actionsList.length > 0; i=(i+1)%this.actionsList.length){
      while(!this.executing){
        await new Promise(f => setTimeout(f, this.delay>250 ? this.delay : 250));
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
      await new Promise(f => setTimeout(f, this.delay));
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

  async saveBeforeExit(){
    await this.saveActionsToFile(await appConfigDir() + this.SETTINGS_FILE_NAME, true);
  }

  async saveActions(path: string) {
    await this.saveActionsToFile(path, false);
  }

  private async saveActionsToFile(path: string, hidden: boolean) {
    await this.tauriService.saveFile(path, this.export(), hidden);
  }

  async openActions(path: string){
    await this.tauriService.openFile(path).then(content => {
      if(content !== ""){
        this.actionsList = JSON.parse(content);
      }
    });
  }
}
