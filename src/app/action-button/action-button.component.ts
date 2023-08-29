import {Component, HostBinding, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent implements OnInit, OnChanges{
  @Input()
  public color: string | undefined;
  @Input()
  public filled: boolean = false;
  public textColor: string = 'black';

  @HostBinding('style.background-color') backgroundColor!: string;
  @HostBinding('style.border-color') borderColor!: string;

  ngOnInit() {
    if(this.color){
      this.backgroundColor = this.filled ? this.color : 'midnightblue';
      this.borderColor = this.color;
      this.textColor = 'white';
    }
  }

  ngOnChanges() {
    if(this.color) {
      this.backgroundColor = this.filled ? this.color : 'midnightblue';
    }
  }

}
