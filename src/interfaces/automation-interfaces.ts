export class AutomationItem {
  public type: AutomationType = AutomationType.WAIT;
  public active: boolean = false;
  public duration: number = 1000;
  public waited: number | undefined;
  public position: Position = new Position();
  public mouseButton: MouseButton = MouseButton.LEFT;
  public scrollAmount: number = 0;
  public keyboardTyping: string = '';
}

export enum AutomationType {
  WAIT = "Wait",
  MOVE_MOUSE = "Move Mouse",
  CLICK_MOUSE = "Click",
  SCROLL_MOUSE = "Scroll",
  KEYBOARD_TYPE = "Text Type",
  KEYBOARD_SEQUENCE = "Key Sequence",
}

export class Position {
  public x: number = 0;
  public y: number = 0;
}

export enum MouseButton {
  LEFT = "Left",
  RIGHT = "Right",
}
