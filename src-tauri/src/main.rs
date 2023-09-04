// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod coords;

use coords::Coords;

use std::env;
use std::fs::{create_dir_all, File};
use std::fs::OpenOptions;
use std::path::Path;
use std::io::{Read, Write};
use std::os::windows::fs::{OpenOptionsExt};
use enigo::*;

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, Manager};

const FILE_ATTRIBUTE_HIDDEN: u32 = 2;

fn main() {
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let show = CustomMenuItem::new("show".to_string(), "Show");
  let tray_menu = SystemTrayMenu::new()
    .add_item(quit)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(show);

  tauri::Builder::default()
    // TODO: remove call to setup to remove devtools
    // .setup(|app| {
    //   #[cfg(debug_assertions)] // only include this code on debug builds
    //   {
    //     let window = app.get_window("main").unwrap();
    //     window.open_devtools();
    //     window.close_devtools();
    //   }
    //   Ok(())
    // })
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "show" => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![
      get_current_dir, save_file, open_file, logging,
      click_mouse, move_mouse, scroll_mouse, keyboard_type, keyboard_sequence, get_coords
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn get_current_dir() -> String {
  return env::current_dir()
    .expect("Unable to retrieve current dir")
    .as_path()
    .to_str()
    .expect("No current dir")
    .to_string();
}

#[tauri::command]
fn save_file(path: String, content: String, hidden: bool){

  match path.rfind('\\') {
    Some(slash_index) => {
      let file_dir = (&path[..slash_index]).to_string();

      let path_to_file_dir = Path::new(&file_dir);

      if !path_to_file_dir.exists() {
        create_dir_all(&file_dir).expect("Unable to create missing dir");
      }
    }
    None => {}
  }

  let mut binding = OpenOptions::new();
  let open_options = binding.write(true).create(true).truncate(true);

  if hidden {
    open_options.attributes(FILE_ATTRIBUTE_HIDDEN);
  }

  let mut file = open_options.open(path).expect("Unable to use file");

  file.write_all(content.as_ref()).expect("Unable to write file");
}

#[tauri::command]
fn open_file(path: String) -> String {
  let mut contents = String::new();
  let file = File::open(&path);
  match file {
    Ok(mut f) => {
      f.read_to_string(&mut contents).expect("Unable to read file");
    }
    Err(_) => {}
  }
  return contents;
}

#[tauri::command]
fn logging(msg: String){
  println!("JS log: {}", msg);
}

#[tauri::command]
fn click_mouse(button: &str) {
  let mut enigo = Enigo::new();
  enigo.mouse_click(match button {
    "Left" => {
      MouseButton::Left
    }
    "Right" => {
      MouseButton::Right
    }
    _ => {MouseButton::Left}
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

