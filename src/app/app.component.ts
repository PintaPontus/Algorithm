import { Component } from '@angular/core';
import {AutomationService} from "./automation.service";
import {appWindow} from "@tauri-apps/api/window";
import {confirm} from "@tauri-apps/api/dialog";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'algorithm';

  constructor(controller: AutomationService) {
    appWindow.listen("tauri://close-requested", async () => {
      if(await confirm("Close App?", {okLabel: "Minimize", cancelLabel: "Close"})){
        await appWindow.hide();
      }else{
        await controller.saveBeforeExit();
        await appWindow.close();
      }
    });
  }
}
