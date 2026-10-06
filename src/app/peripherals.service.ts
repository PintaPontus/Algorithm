import {DestroyRef, inject, Service, signal} from '@angular/core';
import {filter, fromEvent, map, merge, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { invoke } from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';
import {CursorCoordinates} from '../interfaces/peripherals';

@Service()
export class PeripheralsService {

  private readonly destroyRef = inject(DestroyRef);

  private readonly keyPressedSubject = new Subject<string>();
  private readonly cursorCoordinates = signal<CursorCoordinates>({x: 0, y: 0});
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

    const unlisten = listen<CursorCoordinates>('cursor-moved', (event) =>
      this.cursorCoordinates.set(event.payload)
    );

    this.destroyRef.onDestroy(() => unlisten.then((fn) => fn()));
  }

  simPress(key: string){
    console.log("Tasto simulato: ", key);
    this.emitKey(key);
  }

  async emulate(key: string) {
    await invoke('emulate_key', { key });
  }

  async moveCursor(coords: CursorCoordinates) {
    await invoke('move_cursor', { coords });
  }

  async dragCursor(start: CursorCoordinates, finish: CursorCoordinates) {
    await invoke('drag_cursor', { start, finish }).catch(e => {console.error(e)});
  }

  getCursorCoordinates() {
    return this.cursorCoordinates.asReadonly();
  }

  private emitKey(key: string) {
    this.keyPressedSubject.next(key);
  }

}
