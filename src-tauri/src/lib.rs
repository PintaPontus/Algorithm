use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use crate::emulation::core::CursorCoordinates;

mod emulation;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
          spawn_cursor_watcher(app.handle().clone());
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![emulate_key, move_cursor])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}

#[tauri::command]
fn emulate_key(key: String) -> Result<(), String> {
    emulation::core::press(&key)
}

#[tauri::command]
fn move_cursor(x: i32, y: i32) -> Result<(), String> {
    emulation::core::move_cursor(x, y)
}

fn spawn_cursor_watcher(app: AppHandle) {
  thread::spawn(move || {
    let mut last: Option<CursorCoordinates> = None;
    loop {
      if let Ok(pos) = emulation::core::cursor_position() {
        if last != Some(pos.clone()) {
          last = Some(pos.clone());
          let _ = app.emit("cursor-moved", pos);
        }
      }
      thread::sleep(Duration::from_millis(10));
    }
  });
}
