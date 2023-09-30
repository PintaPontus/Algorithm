use std::str::FromStr;

pub enum AlgorithmTrayAction {
    Play,
    Pause,
    Stop,
    Show,
    Quit,
}

impl Into<String> for AlgorithmTrayAction {
    fn into(self) -> String {
        match self {
            AlgorithmTrayAction::Play => "Play".to_string(),
            AlgorithmTrayAction::Pause => "Pause".to_string(),
            AlgorithmTrayAction::Stop => "Stop".to_string(),
            AlgorithmTrayAction::Show => "Show".to_string(),
            AlgorithmTrayAction::Quit => "Quit".to_string(),
        }
    }
}

impl FromStr for AlgorithmTrayAction {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Play" => Ok(AlgorithmTrayAction::Play),
            "Pause" => Ok(AlgorithmTrayAction::Pause),
            "Stop" => Ok(AlgorithmTrayAction::Stop),
            "Show" => Ok(AlgorithmTrayAction::Show),
            "Quit" => Ok(AlgorithmTrayAction::Quit),
            _ => Err(format!("{} doesn't exist", s)),
        }
    }
}
