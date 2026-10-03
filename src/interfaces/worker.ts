export type MainToWorker =
  | { type: 'onStart'; code: string }
  | { type: 'onKey'; key: string };

/** Messaggi worker -> main thread */
export type WorkerToMain =
  | { type: 'print'; message: string }
  | { type: 'pressKey'; key: string }
  | { type: 'moveCursor'; x: number; y: number }
  | { type: 'log'; message: string, level: 'info' | 'error'};
