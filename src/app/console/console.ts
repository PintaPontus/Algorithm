import {Component, inject, input} from '@angular/core';
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

  readonly text = input<string|undefined>();
  readonly output = this.blocklyService.getOutput();

  copy() {
    const content = this.text() ?? this.output();
    content && navigator.clipboard.writeText(content.trim());
  }

  clear() {
    this.blocklyService.clearOutput();
  }

}
