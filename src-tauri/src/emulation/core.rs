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
pub fn move_cursor(x: i32, y: i32) -> Result<(), String> {
    use windows::Win32::UI::WindowsAndMessaging::SetCursorPos;

    unsafe { SetCursorPos(x, y) }
        .map_err(|e| format!("Impossibile spostare il cursore a ({x}, {y}): {e}"))
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
pub fn press(key: &str) -> Result<(), String> {
    todo!("Aggiungere un crate per emulare tastiera e mouse su macOS e Linux")
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
pub fn move_cursor(x: i32, y: i32) -> Result<(), String> {
    todo!("Aggiungere un crate per emulare tastiera e mouse su macOS e Linux")
}
