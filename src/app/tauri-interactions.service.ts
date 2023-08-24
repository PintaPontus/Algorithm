import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/tauri';

@Injectable({
  providedIn: 'root'
})
export class TauriInteractionsService {

  constructor() { }

  public click(){
    invoke('click')
      .then(()=>console.log("Clicked"));
  }

  public move(x: number, y: number){
    invoke('move_mouse', {x: x, y: y})
      .then(()=>console.log("Moved to {} {}", x, y));
  }

}
