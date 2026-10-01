use windows::Win32::UI::Input::KeyboardAndMouse::*;

pub(crate) fn key_to_vk(key: &str) -> Option<VIRTUAL_KEY> {
    Some(match key {
        "Enter" => VK_RETURN,
        "Space" => VK_SPACE,
        "Escape" => VK_ESCAPE,
        "Tab" => VK_TAB,
        "Backspace" => VK_BACK,
        "ArrowUp" => VK_UP,
        "ArrowDown" => VK_DOWN,
        "ArrowLeft" => VK_LEFT,
        "ArrowRight" => VK_RIGHT,
        k if k.len() == 1 && k.chars().next()?.is_ascii_lowercase() => {
            VIRTUAL_KEY(k.to_ascii_uppercase().as_bytes()[0] as u16)
        }
        _ => return None,
    })
}

pub(crate) fn keyboard(vk: VIRTUAL_KEY, flags: KEYBD_EVENT_FLAGS) -> INPUT {
    INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: vk,
                wScan: 0,
                dwFlags: flags,
                time: 0,
                dwExtraInfo: 0,
            },
        },
    }
}

pub(crate) fn mouse(flags: MOUSE_EVENT_FLAGS) -> INPUT {
    INPUT {
        r#type: INPUT_MOUSE,
        Anonymous: INPUT_0 {
            mi: MOUSEINPUT {
                dx: 0,
                dy: 0,
                mouseData: 0,
                dwFlags: flags,
                time: 0,
                dwExtraInfo: 0,
            },
        },
    }
}
