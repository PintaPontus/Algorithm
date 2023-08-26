import {Component} from '@angular/core';
import {AutomationService} from "../automation.service";
import {AutomationItem} from "../../interfaces/automation-interfaces";

@Component({
  selector: 'action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.scss']
})
export class ActionListComponent {

  public controller: AutomationService;
  public actionsList: AutomationItem[];

  constructor(controller: AutomationService) {
    this.controller = controller;
    this.actionsList = controller.actionsList;
  }

  remove(i: number) {
    this.actionsList.splice(i, 1)
  }

  clone(i: number) {
    this.actionsList.splice(i, 0, JSON.parse(JSON.stringify(this.actionsList[i])));
  }

  move(index: number, dir: boolean) {
    if((index === 0 && dir) ||
      (index === (this.actionsList.length || 0) - 1 && (!dir)) ||
      (this.actionsList.length === 1)){
      return;
    }
    if(!dir){
      index++;
    }
    let moving = this.actionsList[index];
    this.actionsList[index] = this.actionsList[index-1];
    this.actionsList[index-1] = moving;
  }
}
