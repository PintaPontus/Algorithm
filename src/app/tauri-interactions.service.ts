import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/tauri';
import {Position} from "../interfaces/automation-interfaces";

@Injectable({
  providedIn: 'root'
})
export class TauriInteractionsService {

  constructor() { }

  public log_rust(msg: string) {
    invoke('logging', {msg: String(msg)})
  }

  public click(){
    invoke('click')
  }

  public move(x: number, y: number){
    invoke('move_mouse', {x: x, y: y})
  }

  async retrieveCoords() {
    let result: any;
    await invoke('get_coords')
      .then(c=> result = c)
      .catch(()=>{});
    let position = new Position();
    position.x = result.x;
    position.y = result.y;
    return position;
  }
}
