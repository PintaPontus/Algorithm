import {TauriInteractionsService} from "../app/tauri-interactions.service";

export class AutomationController{

  private actionsList: AutomationItem[];
  private tauriService: TauriInteractionsService;
  constructor(actionsList: AutomationItem[], tauriService: TauriInteractionsService) {
    this.actionsList = actionsList;
    this.tauriService = tauriService;
  }


  play() {
    console.log("PLAY");
    this.tauriService.click();
  }

  pause() {
    console.log("PAUSE");
  }

  stop() {
    console.log("STOP");
  }

  add() {
    console.log("ADD");
    this.actionsList.push(new AutomationItem())
  }
}

export class AutomationItem {
  public type: AutomationType | undefined;
  public duration: number = 1000;
  public position: Position = new Position();
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
