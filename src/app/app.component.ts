import { Component } from '@angular/core';
import {appWindow, PhysicalSize} from '@tauri-apps/api/window';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'algorithm';
  constructor() {
    appWindow.setMinSize(new PhysicalSize(1200, 600));
  }
}
