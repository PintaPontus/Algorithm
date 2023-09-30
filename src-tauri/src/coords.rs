use serde::ser::SerializeStruct;
use serde::Serializer;

pub struct Coords {
    pub x: i32,
    pub y: i32,
}
impl Coords {
    pub fn new(coords: (i32, i32)) -> Self {
        return Coords {
            x: coords.0,
            y: coords.1,
        };
    }
}

impl serde::ser::Serialize for Coords {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("Coords", 2)?;
        state.serialize_field("x", &self.x)?;
        state.serialize_field("y", &self.y)?;
        state.end()
    }
}
