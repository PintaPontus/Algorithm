import {Component, inject} from '@angular/core';
import {BlocklyService} from '../blockly.service';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  imports: [
    MatFormField,
    MatInput,
    MatIcon,
    MatIconButton,
    MatTooltip
  ],
  selector: 'app-console',
  styleUrl: './console.css',
  templateUrl: './console.html',
})
export class Console {

  private readonly blocklyService = inject(BlocklyService)

  readonly output = this.blocklyService.getOutput();

  copy() {
    const content = this.output()
    content && navigator.clipboard.writeText(content);
  }

  clear() {
    this.blocklyService.clearOutput();
  }
}
