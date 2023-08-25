// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mouse_rs::{Mouse};
use std::{thread, time};
use mouse_rs::types::keys::Keys;
use mouse_rs::types::Point;
use serde::ser::SerializeStruct;
use serde::{Serializer};
use tauri::Manager;

fn main() {
  tauri::Builder::default()
      // TODO: remove call to setup to remove devtools
      .setup(|app| {
      #[cfg(debug_assertions)] // only include this code on debug builds
      {
        let window = app.get_window("main").unwrap();
        window.open_devtools();
        window.close_devtools();
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![logging, click, move_mouse, get_coords])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn logging(msg: String){
  println!("JS log: {}", msg);
}

#[tauri::command]
fn click() {
  let mouse = Mouse::new();
  thread::sleep(time::Duration::from_millis(1000));
  mouse.click(&Keys::LEFT).expect("Unable to click with mouse");
  println!("Click Invoked From JS");
}

#[tauri::command]
fn move_mouse(x: i32, y: i32) {
  let mouse = Mouse::new();
  thread::sleep(time::Duration::from_millis(1000));
  mouse.move_to(x, y).expect("Unable to move mouse");
  println!("Move To {} {} Invoked From JS!", x, y);
}

#[tauri::command]
fn get_coords() -> Coords {
  let mouse = Mouse::new();
  let coords = Coords::new(mouse.get_position().expect("Unable to get mouse position"));
  // println!("Mouse In {} {} Invoked From JS!", coords.x, coords.y);
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
