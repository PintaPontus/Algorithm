import {Service} from '@angular/core';
import {load, Store} from '@tauri-apps/plugin-store';
import {isTauri} from '@tauri-apps/api/core';

@Service()
export class StorageService {

  private store: Promise<Store> | undefined;

  private getStore(): Promise<Store> {
    this.store ??= load('state.json', {autoSave: 500, defaults: {}}).catch((e) => {
      this.store = undefined; // permette di riprovare alla chiamata successiva
      console.error('Apertura store fallita:', e);
      throw e;
    });
    return this.store;
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!isTauri()) {
      const raw = localStorage.getItem(key);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    }
    return (await this.getStore()).get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!isTauri()) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    await (await this.getStore()).set(key, value);
    // await this.flush();
    await this.print();
  }

  async flush() {
    if (!isTauri()) return;
    await (await this.getStore()).save();
  }

  async print() {
    console.log("isTauri: ", isTauri())
    if (!isTauri()) return;
    console.log(await (await this.getStore()).values());
  }
}
