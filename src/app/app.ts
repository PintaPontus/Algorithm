import {Component, inject, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BlockWorkspace} from './block-workspace/block-workspace';
import {PeripheralsService} from './peripherals.service';

@Component({
  imports: [RouterOutlet, BlockWorkspace],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly peripheralsService = inject(PeripheralsService);
  private readonly workspace = viewChild.required(BlockWorkspace);

  runCode() {
    this.workspace().runCode();
  }

  press() {
    const key = 'Mouse 1';
    this.peripheralsService.emitKey(key);
  }

}
