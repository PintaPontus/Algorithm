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
