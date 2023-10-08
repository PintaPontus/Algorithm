import {Component} from '@angular/core';
import {Position} from "../../interfaces/automation-interfaces";
import {TauriInteractionsService} from "../tauri-interactions.service";
import {AutomationService} from "../automation.service";

@Component({
    selector: 'control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {

    private tauriService: TauriInteractionsService;
    public controller: AutomationService;
    public actualMouseCoords: Position = new Position();

    constructor(tauriService: TauriInteractionsService, controller: AutomationService) {
        this.tauriService = tauriService;
        this.controller = controller;
        this.updateMouseCoords();
    }

    updateMouseCoords() {
        let updateCoordsLoop = setInterval(() => {
            this.tauriService.retrieveCoords()
                .then(coords => {
                    this.actualMouseCoords.x = coords.x;
                    this.actualMouseCoords.y = coords.y;
                }).catch(_ => {
                clearInterval(updateCoordsLoop);
            });
        }, 250);
    }
}
