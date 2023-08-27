// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::fs::File;
use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::os::windows::fs::{OpenOptionsExt};
use mouse_rs::{Mouse};
use mouse_rs::types::keys::Keys;
use mouse_rs::types::Point;
use serde::ser::SerializeStruct;
use serde::{Serializer};

fn main() {
  tauri::Builder::default()
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
  const FILE_ATTRIBUTE_HIDDEN: u32 = 2;

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

pub struct Coords {
  pub x: i32,
  pub y: i32,
}
impl Coords{
  pub fn new(p: Point) -> Self{
    return Coords{
      x: p.x,
      y: p.y
    };
  }
}

impl serde::ser::Serialize for Coords{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
    let mut state = serializer.serialize_struct("Coords", 2)?;
    state.serialize_field("x", &self.x)?;
    state.serialize_field("y", &self.y)?;
    state.end()
  }
}
