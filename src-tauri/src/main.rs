// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod coords;
mod persistence;
mod sys_tray;

use std::str::FromStr;

use coords::Coords;
use persistence::*;
use sys_tray::AlgorithmTrayAction;

use enigo::*;
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

fn main() {
    tauri::Builder::default()
        .system_tray(
            SystemTray::new().with_menu(
                SystemTrayMenu::new()
                    .add_item(CustomMenuItem::new(
                        AlgorithmTrayAction::Play,
                        AlgorithmTrayAction::Play,
                    ))
                    .add_item(CustomMenuItem::new(
                        AlgorithmTrayAction::Pause,
                        AlgorithmTrayAction::Pause,
                    ))
                    .add_item(CustomMenuItem::new(
                        AlgorithmTrayAction::Stop,
                        AlgorithmTrayAction::Stop,
                    ))
                    .add_native_item(SystemTrayMenuItem::Separator)
                    .add_item(CustomMenuItem::new(
                        AlgorithmTrayAction::Show,
                        AlgorithmTrayAction::Show,
                    ))
                    .add_item(CustomMenuItem::new(
                        AlgorithmTrayAction::Quit,
                        AlgorithmTrayAction::Quit,
                    )),
            ),
        )
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match AlgorithmTrayAction::from_str(id.as_str())
                    .unwrap_or(AlgorithmTrayAction::Show)
                {
                    AlgorithmTrayAction::Play => {
                        app.emit_all("algo://play-request", ()).unwrap_or(());
                    }
                    AlgorithmTrayAction::Pause => {
                        app.emit_all("algo://pause-request", ()).unwrap_or(());
                    }
                    AlgorithmTrayAction::Stop => {
                        app.emit_all("algo://stop-request", ()).unwrap_or(());
                    }
                    AlgorithmTrayAction::Show => {
                        let window = app.get_window("main").expect("Unable to retrieve window");
                        window.show().expect("Unable to show window");
                        window.set_focus().expect("Unable to focus window");
                    }
                    AlgorithmTrayAction::Quit => {
                        if app.emit_all("tauri://close-requested", ()).is_err() {
                            app.exit(0);
                        }
                    }
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_current_dir,
            save_file,
            open_file,
            logging,
            click_mouse,
            move_mouse,
            scroll_mouse,
            keyboard_type,
            keyboard_sequence,
            get_coords
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn logging(msg: String) {
    println!("JS log: {}", msg);
}

#[tauri::command]
fn click_mouse(button: &str) {
    Enigo::new().mouse_click(match button {
        "Left" => MouseButton::Left,
        "Right" => MouseButton::Right,
        _ => MouseButton::Left,
    });
}

#[tauri::command]
fn move_mouse(x: i32, y: i32) {
    Enigo::new().mouse_move_to(x, y);
}

#[tauri::command]
fn scroll_mouse(amount: i32) {
    Enigo::new().mouse_scroll_y(amount);
}

#[tauri::command]
fn keyboard_type(typing: &str) {
    Enigo::new().key_sequence(typing);
}

#[tauri::command]
fn keyboard_sequence(sequence: &str) {
    Enigo::new().key_sequence_parse(sequence);
}

#[tauri::command]
fn get_coords() -> Coords {
    return Coords::new(Enigo::new().mouse_location());
}
