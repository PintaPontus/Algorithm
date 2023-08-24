use mouse_rs::{Mouse};
use std::{thread, time};



fn main() {
    let mouse = Mouse::new();
    loop {
        mouse.move_to(500, 500).expect("Unable to move mouse");
        thread::sleep(time::Duration::from_millis(10000));
        mouse.move_to(510, 510).expect("Unable to move mouse");
        thread::sleep(time::Duration::from_millis(10000));
    }
}
