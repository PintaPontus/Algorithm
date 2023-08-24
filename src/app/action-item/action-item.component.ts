import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AutomationItem, AutomationType} from "../../interfaces/automation-interfaces";

@Component({
  selector: 'action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.scss']
})
export class ActionItemComponent {
  @Input("action")
  public action: AutomationItem | undefined;
  protected readonly AutomationType = AutomationType;
  protected readonly Object = Object;

  @Output() delete: EventEmitter<any> = new EventEmitter();

  deleteMe() {
    this.delete.emit(null);
  }
}
