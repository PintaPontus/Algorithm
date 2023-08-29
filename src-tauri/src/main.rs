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
use mouse_rs::{Mouse};
use mouse_rs::types::keys::Keys;

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
      get_current_dir, save_file, open_file, logging, click, move_mouse, get_coords
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
  let open_options = binding.write(true).create(true);

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
fn click() {
  let mouse = Mouse::new();
  mouse.click(&Keys::LEFT).expect("Unable to click with mouse");
}

#[tauri::command]
fn move_mouse(x: i32, y: i32) {
  let mouse = Mouse::new();
  mouse.move_to(x, y).expect("Unable to move mouse");
}

#[tauri::command]
fn get_coords() -> Coords {
  let mouse = Mouse::new();
  let coords = Coords::new(mouse.get_position().expect("Unable to get mouse position"));
  return coords;
}

