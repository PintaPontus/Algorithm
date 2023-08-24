import {Component, Input} from '@angular/core';
import {AutomationItem, AutomationController} from "../../interfaces/automation-interfaces";

@Component({
  selector: 'action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.scss']
})
export class ActionListComponent {
  @Input("action-list")
  public actionsList: AutomationItem[] | undefined;

  @Input()
  public controller: AutomationController | undefined;

  remove(i: number) {
    this.actionsList?.splice(i, 1)
  }
}
