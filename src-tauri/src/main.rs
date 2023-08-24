// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mouse_rs::{Mouse};
use std::{thread, time};
use mouse_rs::types::keys::Keys;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![click, move_mouse])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
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
