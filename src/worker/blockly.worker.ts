import type {MainToWorker, WorkerToMain} from '../interfaces/worker';

type Handler = () => void | Promise<void>;

const startHandlers: Handler[] = [];
const keyHandlers = new Map<string, Handler[]>();

const post = (message: WorkerToMain) => postMessage(message);

async function guard(handler: Handler) {
  try {
    await handler();
  } catch (e) {
    post({type: 'log', message: String(e), level: "error"});
  }
}

const onStart = (callback: Handler) => {
  startHandlers.push(callback);
};

const onKey = (key: string, callback: Handler) => {
  const list = keyHandlers.get(key) ?? [];
  list.push(callback);
  keyHandlers.set(key, list);
};

const print = (message: unknown) => post({type: 'print', message: String(message)});
const pressKey = (key: unknown) => post({type: 'pressKey', key: String(key)});
const moveCursor = (x: unknown, y: unknown) =>
  post({type: 'moveCursor', x: Number(x), y: Number(y)});

const abort = () => post({type: 'abort'});

async function run(code: string) {
  try {
    new Function(
      'onStart',
      'onKey',
      'print',
      'pressKey',
      'moveCursor',
      'abort',
      code
    )(
      onStart,
      onKey,
      print,
      pressKey,
      moveCursor,
      abort
    );
  } catch (e) {
    post({type: 'log', message: String(e), level: "error"});
    return;
  }

  await Promise.allSettled(
    startHandlers.map(handler => guard(handler))
  );
  post({type: 'stop'});
}

addEventListener('message', ({data}: MessageEvent<MainToWorker>) => {
  switch (data.type) {
    case 'onStart':
      void run(data.code);
      break;
    case 'onKey': {
      const handlers = keyHandlers.get(data.key);
      if (!handlers) return;
      post({type: 'log', message: `Input tasto: ${data.key}`, level: "info"});
      for (const handler of handlers) void guard(handler);
      break;
    }
  }
});
