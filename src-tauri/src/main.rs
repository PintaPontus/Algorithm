// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod coords;
mod persistence;

use coords::Coords;

use enigo::*;
use persistence::*;

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(show);

    tauri::Builder::default()
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                }
                _ => {}
            },
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
    let mut enigo = Enigo::new();
    enigo.mouse_click(match button {
        "Left" => MouseButton::Left,
        "Right" => MouseButton::Right,
        _ => MouseButton::Left,
    });
}

#[tauri::command]
fn move_mouse(x: i32, y: i32) {
    let mut enigo = Enigo::new();
    enigo.mouse_move_to(x, y);
}

#[tauri::command]
fn scroll_mouse(amount: i32) {
    let mut enigo = Enigo::new();
    enigo.mouse_scroll_y(amount);
}

#[tauri::command]
fn keyboard_type(typing: &str) {
    let mut enigo = Enigo::new();
    enigo.key_sequence(typing);
}

#[tauri::command]
fn keyboard_sequence(sequence: &str) {
    let mut enigo = Enigo::new();
    enigo.key_sequence_parse(sequence);
}

#[tauri::command]
fn get_coords() -> Coords {
    let enigo = Enigo::new();
    return Coords::new(enigo.mouse_location());
}
