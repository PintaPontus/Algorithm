import {Component} from '@angular/core';
import {AutomationService} from "../automation.service";

@Component({
    selector: 'action-list',
    templateUrl: './action-list.component.html',
    styleUrls: ['./action-list.component.scss']
})
export class ActionListComponent {

    public controller: AutomationService;

    constructor(controller: AutomationService) {
        this.controller = controller;
    }

    remove(i: number) {
        this.controller.actionsList.splice(i, 1)
    }

    clone(i: number) {
        this.controller.actionsList.splice(i, 0,
            JSON.parse(JSON.stringify(this.controller.actionsList[i]))
        );
    }

    move(index: number, dir: boolean) {
        if ((index === 0 && dir) ||
            (index === (this.controller.actionsList.length || 0) - 1 && (!dir)) ||
            (this.controller.actionsList.length === 1)) {
            return;
        }
        if (!dir) {
            index++;
        }
        [this.controller.actionsList[index], this.controller.actionsList[index - 1]] =
            [this.controller.actionsList[index - 1], this.controller.actionsList[index]];
    }
}
