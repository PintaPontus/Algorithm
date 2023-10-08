import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AutomationItem, AutomationType, MouseButton} from "../../interfaces/automation-interfaces";

@Component({
    selector: 'action-item',
    templateUrl: './action-item.component.html',
    styleUrls: ['./action-item.component.scss']
})
export class ActionItemComponent {
    @Input("action")
    public action: AutomationItem | undefined;
    protected readonly Object = Object;
    protected readonly AutomationType = AutomationType;
    protected readonly MouseButton = MouseButton;

    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() clone: EventEmitter<AutomationItem> = new EventEmitter();
    @Output() move: EventEmitter<boolean> = new EventEmitter();

    deleteMe() {
        this.delete.emit(null);
    }

    cloneMe() {
        this.clone.emit(this.action);
    }

    moveUp() {
        this.move.emit(true);
    }

    moveDown() {
        this.move.emit(false);
    }
}
