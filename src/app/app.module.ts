import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActionListComponent } from './action-list/action-list.component';
import { ActionControlsComponent } from './action-controls/action-controls.component';
import { ActionButtonComponent } from './action-button/action-button.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { ActionItemComponent } from './action-item/action-item.component';
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    ActionListComponent,
    ActionControlsComponent,
    ActionButtonComponent,
    ControlPanelComponent,
    ActionItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
