import {CursorCoordinates} from './peripherals';

export type MainToWorker =
  | { type: 'onStart'; code: string }
  | { type: 'onKey'; key: string };

/** Messaggi worker -> main thread */
export type WorkerToMain =
  | { type: 'stop' }
  | { type: 'abort' }
  | { type: 'print'; message: string }
  | { type: 'pressKey'; key: string }
  | { type: 'moveCursor'; coords: CursorCoordinates }
  | { type: 'dragCursor'; start: CursorCoordinates; finish: CursorCoordinates }
  | { type: 'log'; message: string, level: 'info' | 'error'};
