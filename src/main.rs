use mouse_rs::{Mouse};
use std::{thread, time};

fn main() {
    let mouse = Mouse::new();
    loop {
        let position = mouse.get_position().expect("Unable to retrieve mouse position");
        thread::sleep(time::Duration::from_millis(5000));
        mouse.move_to(position.x+100, position.y).expect("Unable to move mouse");
        thread::sleep(time::Duration::from_millis(5000));
        mouse.move_to(position.x, position.y).expect("Unable to move mouse");
    }
}
