import { Injectable } from '@angular/core';
import {TauriInteractionsService} from "./tauri-interactions.service";
import {AutomationItem, AutomationType} from "../interfaces/automation-interfaces";
import {appConfigDir} from "@tauri-apps/api/path";
import {appWindow, LogicalSize} from "@tauri-apps/api/window";
import {confirm} from "@tauri-apps/api/dialog";

@Injectable({
  providedIn: 'root'
})
export class AutomationService {

  private tauriService: TauriInteractionsService;
  public actionsList: AutomationItem[] = [];
  private stopped: boolean = true;
  private executing: boolean = false;
  public cycle: boolean = true;
  public delay: number = 100;
  private readonly SETTINGS_FILE_NAME: string = ".algorithm-actions.json";
  private readonly WAITING_STEP: number = 50;
  public CURRENT_DIR: string = "";
  constructor(tauriService: TauriInteractionsService) {
    this.tauriService = tauriService;

    this.initWindow();
    this.initSettings();
  }

  private initWindow(){
    Promise.allSettled([
      appWindow.setMinSize(new LogicalSize(1200, 600)),
      appWindow.listen("tauri://close-requested", async () => {
        if(await confirm("Close App?", {okLabel: "Minimize", cancelLabel: "Close"})){
          await appWindow.hide();
        }else{
          await this.saveBeforeExit();
          await appWindow.close();
        }
      })
    ]).then(r => {
      this.tauriService.log_rust(`Init Window Done: ${JSON.stringify(r)}`);
    });
  }

  private async initSettings(){
    Promise.allSettled([
      this.setPaths(),
      this.openActions(await appConfigDir() + this.SETTINGS_FILE_NAME)
    ]).then(r => {
      this.tauriService.log_rust(`Init Settings Done: ${JSON.stringify(r)}`);
    });
  }

  private async setPaths(){
    this.CURRENT_DIR = await this.tauriService.getCurrentDir();
  }

  async automation_loop(){
    let actualItem: AutomationItem;
    let previousItem: AutomationItem | undefined;
    function deactivatePrevious(previousItem: AutomationItem){
      previousItem.waited = undefined;
      previousItem.active = false;
    }
    for(let i = 0; !this.stopped && this.actionsList.length > 0; i=(i+1)%this.actionsList.length){
      while(!this.executing && !this.stopped && this.actionsList.length > 0){
        await new Promise(f => setTimeout(f, this.delay>100 ? this.delay : 100));
      }

      if(previousItem) {
        deactivatePrevious(previousItem);
      }

      if(this.actionsList.length === 0){
        this.stopped = true;
      }

      if(this.stopped){
        break;
      }

      actualItem = this.actionsList[i];
      actualItem.active = true;

      switch (actualItem.type){
        case AutomationType.WAIT:

          if(actualItem.duration <= this.WAITING_STEP){
            await new Promise(f => setTimeout(f, actualItem.duration));
          }else{
            actualItem.waited = 0;
            while(actualItem.waited<actualItem.duration && this.executing && !this.stopped){
              await new Promise(f => setTimeout(f, this.WAITING_STEP));
              actualItem.waited+=this.WAITING_STEP;
            }
          }
          break;
        case AutomationType.CLICK_MOUSE:
          await this.tauriService.click();
          break;
        case AutomationType.MOVE_MOUSE:
          await this.tauriService.move(actualItem.position.x, actualItem.position.y);
          break;
      }
      await new Promise(f => setTimeout(f, this.delay));
      previousItem = actualItem;
      deactivatePrevious(previousItem);
      if(i+1 === this.actionsList.length && !this.cycle){
        this.stopped = true;
      }
    }

  }

  isWorking(){
    return this.executing && !this.stopped;
  }

  isPaused() {
    return !this.executing && !this.stopped;
  }

  play() {
    if(this.actionsList.length > 0){
      this.executing=true;
      if(this.stopped){
        this.stopped=false;
        this.automation_loop();
      }
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
