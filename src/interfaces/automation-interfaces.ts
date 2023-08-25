import {TauriInteractionsService} from "../app/tauri-interactions.service";

export class AutomationController{

  private stopped: boolean = true;
  private executing: boolean = false;
  public actionsList: AutomationItem[];
  private tauriService: TauriInteractionsService;
  constructor(actionsList: AutomationItem[], tauriService: TauriInteractionsService) {
    this.actionsList = actionsList;
    this.tauriService = tauriService;
  }

  async automation_loop(){
    for(let i = 0; !this.stopped; i=(i+1)%this.actionsList.length){
      while(!this.executing){
        await new Promise(f => setTimeout(f, 1000));
      }
      let actualItem = this.actionsList[i];
      actualItem.active = true;
      switch (actualItem.type){
        case AutomationType.WAIT:
          await new Promise(f => setTimeout(f, actualItem.duration));
          break;
        case AutomationType.CLICK_MOUSE:
          this.tauriService.click();
          break;
        case AutomationType.MOVE_MOUSE:
          this.tauriService.move(actualItem.position.x, actualItem.position.y);
          break;
      }
      actualItem.active = false;
    }
  }

  play() {
    console.log("PLAY");
    this.executing=true;
    if(this.stopped){
      this.stopped=false;
      this.automation_loop();
    }
  }

  pause() {
    console.log("PAUSE");
    this.executing=false;
  }

  stop() {
    console.log("STOP");
    this.stopped=true;
    this.executing=false;
  }

  add() {
    console.log("ADD");
    this.actionsList.push(new AutomationItem())
  }

  import(json: string){
    console.log("IMPORT: ");
    console.log(json);
    console.log(JSON.parse(json));
    this.actionsList = JSON.parse(json);
    console.log(this.actionsList);
  }

  export(){
    return JSON.stringify(this.actionsList);
  }
}

export class AutomationItem {
  public type: AutomationType = AutomationType.WAIT;
  public duration: number = 1000;
  public position: Position = new Position();
  public active: boolean = false;
}

export enum AutomationType {
  MOVE_MOUSE = "Move Mouse",
  CLICK_MOUSE = "Click",
  WAIT = "Wait",
}

export class Position {
  public x: number = 0;
  public y: number = 0;
}
