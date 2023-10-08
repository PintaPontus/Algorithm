import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
    selector: 'action-button',
    templateUrl: './action-button.component.html',
    styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent implements OnInit {
    @Input()
    public color: string | undefined;
    public textColor: string = 'black';

    @HostBinding('style.background-color') backgroundColor!: string;
    @HostBinding('style.border-color') borderColor!: string;

    ngOnInit() {
        if (this.color) {
            this.backgroundColor = 'midnightblue';
            this.borderColor = this.color;
            this.textColor = this.color;
        }
    }

}
