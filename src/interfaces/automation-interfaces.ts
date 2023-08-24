export class AutomationController{

  private actionsList: AutomationItem[];
  constructor(actionsList: AutomationItem[]) {
    this.actionsList = actionsList
  }


  play() {
    console.log("PLAY");
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
