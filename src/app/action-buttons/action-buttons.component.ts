import {Component, Input} from '@angular/core';
import {AutomationController} from "../../interfaces/automation-interfaces";

@Component({
  selector: 'action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent {
  @Input()
  public controller: AutomationController | undefined;

  play() {
    if(this.controller){
      this.controller.play();
    }else{
      console.log("Unable to execute: PLAY");
    }
  }
  pause() {
    if(this.controller){
      this.controller.pause();
    }else{
      console.log("Unable to execute: PAUSE");
    }
  }
  stop(){
    if(this.controller){
      this.controller.stop();
    }else{
      console.log("Unable to execute: STOP");
    }
  }
  add(){
    if(this.controller){
      this.controller.add();
    }else{
      console.log("Unable to execute: ADD");
    }
  }
}
