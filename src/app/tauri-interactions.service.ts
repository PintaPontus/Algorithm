import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/tauri';
import {Position} from "../interfaces/automation-interfaces";

@Injectable({
  providedIn: 'root'
})
export class TauriInteractionsService {

  public async getCurrentDir(){
    return String( await invoke('get_current_dir'));
  }

  public async saveFile(path: string, content: string, hidden: boolean){
    await invoke('save_file', {path: path, content: content, hidden: hidden});
  }

  public async openFile(path: string){
    return String( await invoke('open_file', {path: path}));
  }

  public log_rust(msg: string) {
    invoke('logging', {msg: String(msg)});
  }

  public async click(){
    await invoke('click');
  }

  public async move(x: number, y: number){
    await invoke('move_mouse', {x: x, y: y});
  }

  async retrieveCoords() {
    let position = new Position();
    await invoke('get_coords')
      .then(result=> {
        // @ts-ignore
        position.x = result.x;
        // @ts-ignore
        position.y = result.y;
      })
      .catch(()=>{});
    return position;
  }
}
