use std::os::windows::fs::OpenOptionsExt;
use std::env;
use std::fs::{create_dir_all, File, OpenOptions};
use std::path::Path;
use std::io::{Read, Write};

const WINDOWS_FILE_ATTRIBUTE_HIDDEN: u32 = 2;

#[tauri::command]
pub fn get_current_dir() -> String {
  return env::current_dir()
    .expect("Unable to retrieve current dir")
    .as_path()
    .to_str()
    .expect("No current dir")
    .to_string();
}

#[tauri::command]
pub fn save_file(path: String, content: String, hidden: bool){

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

  let mut file = retrieve_file(path, hidden);

  file.write_all(content.as_ref()).expect("Unable to write file");
}

#[tauri::command]
pub fn open_file(path: String) -> String {
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

#[cfg(target_os = "windows")]
fn retrieve_file(path: String, hidden: bool) -> File{
  let mut binding = OpenOptions::new();
  let open_options = binding.write(true).create(true).truncate(true);

  if hidden {
    open_options.attributes(WINDOWS_FILE_ATTRIBUTE_HIDDEN);
  }

  return open_options.open(path).expect("Unable to use file");
}

#[cfg(target_os = "linux")]
pub fn retrieve_file(path: String, hidden: bool) -> File{
  let mut binding = OpenOptions::new();
  let open_options = binding.write(true).create(true).truncate(true);

  return open_options.open(path).expect("Unable to use file");
}

#[cfg(target_os = "macos")]
pub fn retrieve_file(path: String, hidden: bool) -> File{
  let mut binding = OpenOptions::new();
  let open_options = binding.write(true).create(true).truncate(true);

  return open_options.open(path).expect("Unable to use file");
}
