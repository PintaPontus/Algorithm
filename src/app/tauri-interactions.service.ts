import {Injectable} from '@angular/core';
import {invoke} from '@tauri-apps/api/tauri';
import {MouseButton, Position} from "../interfaces/automation-interfaces";

@Injectable({
    providedIn: 'root'
})
export class TauriInteractionsService {

    public async getCurrentDir() {
        return String(await invoke('get_current_dir'));
    }

    public async saveFile(path: string, content: string, hidden: boolean) {
        await invoke('save_file', {path: path, content: content, hidden: hidden});
    }

    public async openFile(path: string) {
        return String(await invoke('open_file', {path: path}));
    }

    public log_rust(msg: string) {
        invoke('logging', {msg: String(msg)});
    }

    public async click(button: MouseButton) {
        await invoke('click_mouse', {button: button});
    }

    public async moveTo(x: number, y: number) {
        await invoke('move_mouse', {x: x, y: y});
    }

    public async scroll(amount: number) {
        await invoke('scroll_mouse', {amount: amount});
    }

    public async keyboardType(typing: string) {
        await invoke('keyboard_type', {typing: typing});
    }

    public async keyboardSequence(sequence: string) {
        await invoke('keyboard_sequence', {sequence: sequence});
    }

    async retrieveCoords() {
        let position = new Position();
        await invoke('get_coords')
            .then(result => {
                // @ts-ignore
                position.x = result.x;
                // @ts-ignore
                position.y = result.y;
            })
            .catch(() => {
            });
        return position;
    }
}
