use std::thread;
use std::time::Duration;
use crate::emulation::win::mouse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CursorCoordinates {
    pub x: i32,
    pub y: i32,
}

#[cfg(any(target_os = "windows"))]
pub fn press(key: &str) -> Result<(), String> {
    use super::win::{key_to_vk, keyboard, mouse};
    use windows::Win32::UI::Input::KeyboardAndMouse::*;
    let (down, up) = match key {
        "Mouse 1" => (mouse(MOUSEEVENTF_LEFTDOWN), mouse(MOUSEEVENTF_LEFTUP)),
        "Mouse 2" => (mouse(MOUSEEVENTF_RIGHTDOWN), mouse(MOUSEEVENTF_RIGHTUP)),
        "Mouse 3" => (mouse(MOUSEEVENTF_MIDDLEDOWN), mouse(MOUSEEVENTF_MIDDLEUP)),
        other => {
            let vk = key_to_vk(other).ok_or(format!("Tasto non supportato: {other}"))?;
            (
                keyboard(vk, KEYBD_EVENT_FLAGS(0)),
                keyboard(vk, KEYEVENTF_KEYUP),
            )
        }
    };
    unsafe {
        SendInput(&[down], std::mem::size_of::<INPUT>() as i32);
        SendInput(&[up], std::mem::size_of::<INPUT>() as i32);
    }
    Ok(())
}

#[cfg(any(target_os = "windows"))]
pub fn move_cursor(coords: CursorCoordinates) -> Result<(), String> {
    use windows::Win32::UI::WindowsAndMessaging::SetCursorPos;

    unsafe { SetCursorPos(coords.x, coords.y); }
    Ok(())
}

#[cfg(any(target_os = "windows"))]
pub fn drag_cursor(start: CursorCoordinates, finish: CursorCoordinates) -> Result<(), String> {
    use windows::Win32::UI::WindowsAndMessaging::SetCursorPos;
    use windows::Win32::UI::Input::KeyboardAndMouse::*;

    unsafe {
        SetCursorPos(start.x, start.y);
        SendInput(
            &[mouse(MOUSEEVENTF_LEFTDOWN)],
            std::mem::size_of::<INPUT>() as i32,
        );
        thread::sleep(Duration::from_millis(10));
        SetCursorPos(finish.x, finish.y);
        SendInput(
          &[mouse(MOUSEEVENTF_MOVE)],
          std::mem::size_of::<INPUT>() as i32,
        );
        thread::sleep(Duration::from_millis(10));
        SendInput(
            &[mouse(MOUSEEVENTF_LEFTUP)],
            std::mem::size_of::<INPUT>() as i32,
        );
    }
    Ok(())
}

#[cfg(any(target_os = "windows"))]
pub fn cursor_position() -> Result<CursorCoordinates, String> {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

    let mut point = POINT::default();
    unsafe { GetCursorPos(&mut point) }
        .map_err(|e| format!("Impossibile leggere la posizione del cursore: {e}"))?;
    Ok(CursorCoordinates {
        x: point.x,
        y: point.y,
    })
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
pub fn press(key: &str) -> Result<(), String> {
    todo!("Aggiungere un crate per emulare tastiera e mouse su macOS e Linux")
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
pub fn move_cursor(coords: CursorCoordinates) -> Result<(), String> {
    todo!("Aggiungere un crate per emulare tastiera e mouse su macOS e Linux")
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
pub fn drag_cursor(start: CursorCoordinates, finish: CursorCoordinates) -> Result<(), String> {
  todo!("Aggiungere un crate per emulare tastiera e mouse su macOS e Linux")
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
pub fn cursor_position() -> Result<CursorCoordinates, String> {
    todo!("Aggiungere un crate per leggere il cursore su macOS e Linux")
}
