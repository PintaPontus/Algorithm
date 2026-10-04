import {inject, Service} from '@angular/core';
import {load, Store} from '@tauri-apps/plugin-store';
import {isTauri} from '@tauri-apps/api/core';
import {WorkspaceInfo} from '../interfaces/workspace';
import {save, open} from '@tauri-apps/plugin-dialog';
import {readTextFile, writeTextFile} from '@tauri-apps/plugin-fs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Service()
export class StorageService {

  private snackBar = inject(MatSnackBar);

  private settingsStore: Promise<Store> | undefined;
  private workspaceStore: Promise<Store> | undefined;

  private getSettingsStore(): Promise<Store> {
    this.settingsStore ??= load('settings.json', {autoSave: 500, defaults: {}})
      .catch((e) => {
        this.settingsStore = undefined;
        console.error('Apertura store settings fallita:', e);
        throw e;
      });
    return this.settingsStore;
  }

  private getWorkspaceStore(): Promise<Store> {
    this.workspaceStore ??= load('workspace.json', {autoSave: 500, defaults: {}})
      .catch((e) => {
        this.workspaceStore = undefined;
        console.error('Apertura store workspace fallita:', e);
        throw e;
      });
    return this.workspaceStore;
  }

  async getSetting<T>(key: string): Promise<T | undefined> {
    if (!isTauri()) {
      const raw = localStorage.getItem(`set_${key}`);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    }
    return (await this.getSettingsStore()).get<T>(key);
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    if (!isTauri()) {
      localStorage.setItem(`set_${key}`, JSON.stringify(value));
      return;
    }
    await (await this.getSettingsStore()).set(key, value);
  }

  async flushSettings() {
    if (!isTauri()) return;
    await (await this.getSettingsStore()).save();
  }

  async getAllWorkspaces(): Promise<WorkspaceInfo[]> {
    if (!isTauri()) {
      const prefix = 'ws_';
      const result: WorkspaceInfo[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey?.startsWith(prefix)) {
          const raw = localStorage.getItem(fullKey);
          if (raw !== null) {
            result.push(JSON.parse(raw) as WorkspaceInfo);
          }
        }
      }
      return result;
    }
    return (await (await this.getWorkspaceStore()).entries<WorkspaceInfo>())
      .map(([_, value])=> value);
  }

  async getWorkspace(key: string): Promise<WorkspaceInfo | undefined> {
    if (!isTauri()) {
      const raw = localStorage.getItem(`ws_${key}`);
      return raw === null ? undefined : (JSON.parse(raw) as WorkspaceInfo);
    }
    return (await this.getWorkspaceStore()).get<WorkspaceInfo>(key);
  }

  async setWorkspace(key: string, value: WorkspaceInfo): Promise<void> {
    if (!isTauri()) {
      localStorage.setItem(`ws_${key}`, JSON.stringify(value));
      return;
    }
    await (await this.getWorkspaceStore()).set(key, value);
  }

  async deleteWorkspace(key: string): Promise<void> {
    if (!isTauri()) {
      localStorage.removeItem(`ws_${key}`);
      return;
    }
    await (await this.getWorkspaceStore()).delete(key);
  }

  async exportWorkspace(info: WorkspaceInfo) {
    try{
      const path = await save({
        filters: [
          {
            name: 'JSON Script',
            extensions: ['json'],
          },
        ],
      });
      if(path){
        await writeTextFile(
          path,
          JSON.stringify(info)
        );
      }
    } catch (e) {
      this.snackBar.open('Failed to export workspace', 'Ok', {
        duration: 2000,
      });
    }
  }

  async importWorkspace() {
    try{
      const path = await open({
        multiple: false,
        directory: false,
      });
      if(path){
        const contents: WorkspaceInfo = JSON.parse(await readTextFile(path));
        const newId = crypto.randomUUID();
        contents.id = newId;
        await this.setWorkspace(newId, contents);
      }
    } catch (e) {
      this.snackBar.open('Failed to import workspace', 'Ok', {
        duration: 2000,
      });
    }
  }

  async flushWorkspace() {
    if (!isTauri()) return;
    await (await this.getWorkspaceStore()).save();
  }

  async print() {
    if (!isTauri()) return;
    console.log("Settings: ", await (await this.getSettingsStore()).values());
    console.log("Workspaces: ", await (await this.getWorkspaceStore()).values());
  }
}
