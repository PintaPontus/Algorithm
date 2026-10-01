import { Service } from '@angular/core';
import {filter, fromEvent, map, merge, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { invoke } from '@tauri-apps/api/core';

@Service()
export class PeripheralsService {

  private readonly keyPressedSubject = new Subject<string>();
  readonly keyPressed = this.keyPressedSubject.asObservable();

  constructor() {
    const keyboard$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((event) => !event.repeat),
      map((event) => event.key),
    );

    const mouse$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
      map((event) => `Mouse ${event.button + 1}`),
    );

    merge(keyboard$, mouse$)
      .pipe(takeUntilDestroyed())
      .subscribe((key) => this.emitKey(key));
  }

  emitKey(key: string) {
    this.keyPressedSubject.next(key);
  }

  async emulate(key: string) {
    await invoke('emulate_key', { key });
  }

  async moveCursor(x: number, y: number) {
    await invoke('move_cursor', { x: Math.round(x), y: Math.round(y) });
  }

}
