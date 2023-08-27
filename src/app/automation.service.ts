import { Injectable } from '@angular/core';
import {TauriInteractionsService} from "./tauri-interactions.service";
import {AutomationItem, AutomationType} from "../interfaces/automation-interfaces";
import {appWindow} from "@tauri-apps/api/window";

@Injectable({
  providedIn: 'root'
})
export class AutomationService {

  private tauriService: TauriInteractionsService;
  public actionsList: AutomationItem[] = [];
  private stopped: boolean = true;
  private executing: boolean = false;
  public delay: number = 100;
  private SAVINGS_FILE_PATH: string = ".algorithm-actions.json";
  public CURRENT_DIR: string = "";
  public DEFAULT_FILE_PATH: string = "";
  constructor(tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;

    this.setCurrentPath();

    this.openActions(this.SAVINGS_FILE_PATH);

    appWindow.listen("tauri://close-requested", async () => {
      await this.saveActionsToFile(this.SAVINGS_FILE_PATH, true);
      await appWindow.close();
    });
  }

  async setCurrentPath(){
    this.CURRENT_DIR = await this.tauriService.getCurrentDir();
    this.DEFAULT_FILE_PATH = this.CURRENT_DIR + "algorithm-actions.json";
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
