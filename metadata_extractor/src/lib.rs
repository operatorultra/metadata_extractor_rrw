use std::{collections::HashMap, io::Cursor};

use exif::{Reader, Tag};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Metadata {
    make: String,
    model: String,
    flash_found: String,
    gps: String,
    altitude: String,
    description: String,
    copyright: String,
}

#[wasm_bindgen]
impl Metadata {
    #[wasm_bindgen]
    pub fn get_metadata(vector: Vec<u8>) -> Metadata {
        let mut make = String::new();
        let mut model = String::new();
        let mut flash_found = String::new();
        let mut gps = HashMap::new();
        let mut gps_vector: Vec<HashMap<String, String>> = Vec::new();
        let mut altitude = String::new();

        let mut description = String::new();
        let mut copyright = String::new();

        // Create a new EXIF reader
        let exifreader = Reader::new();

        // Read EXIF data from the vector
        let exif = exifreader
            .read_from_container(&mut Cursor::new(vector))
            // If the EXIF data was successfully read, process it
            // Otherwise, display an error message
            .expect("Error reading EXIF data");

        // Iterate through all the fields in the EXIF data
        for field in exif.fields() {
            // Get the tag for the current field
            let tag = field.tag;

            // Process the field based on its tag
            match tag {
                // If the tag is "Make", get the value of the field and store it in the "make" variable
                Tag::Make => {
                    make = field.display_value().with_unit(&exif).to_string();
                }
                // If the tag is "Model", get the value of the field and store it in the "model" variable
                Tag::Model => {
                    model = field.display_value().with_unit(&exif).to_string();
                }
                // If the tag is "Flash", get the value of the field and store it in the "flash_found" variable
                Tag::Flash => {
                    flash_found = field.display_value().with_unit(&exif).to_string();
                }
                // If the tag is "GPSLatitude", get the value of the field and store it in the "gps" map
                Tag::GPSLatitude => {
                    gps.insert(
                        "latitude".to_string(),
                        field.display_value().with_unit(&exif).to_string(),
                    );
                }
                // If the tag is "GPSLongitude", get the value of the field and store it in the "gps" map
                Tag::GPSLongitude => {
                    gps.insert(
                        "longitude".to_owned(),
                        field.display_value().with_unit(&exif).to_string(),
                    );
                }
                // If the tag is "GPSAltitude", get the value of the field and store it in the "altitude" variable
                Tag::GPSAltitude => {
                    altitude = field.display_value().with_unit(&exif).to_string();
                }
                // If the tag is "ImageDescription", get the value of the field and store it in the "description" variable
                Tag::ImageDescription => {
                    description = field.display_value().to_string();
                }
                // If the tag is "Copyright", get the value of the field and store it in the "copyright" variable
                Tag::Copyright => {
                    copyright = field.display_value().to_string();
                }
                // If the tag is something else, log a message
                _ => log("Found a lot more ;)"),
            }
        }

        if gps.len() > 0 {
            gps_vector.push(gps);
        }
        let gps_to_json = serde_json::to_string(&gps_vector).unwrap();

        return Metadata {
            make,
            model,
            flash_found,
            gps: gps_to_json,
            altitude,
            description,
            copyright,
        };
    }

    // The following getters & setters are necessary for the wasm_bindgen to work
    // and to have access to the Metadata struct in the frontend (as JS object)
    #[wasm_bindgen(getter)]
    pub fn make(&self) -> String {
        self.make.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_make(&mut self, make: String) {
        self.make = make;
    }

    #[wasm_bindgen(getter)]
    pub fn model(&self) -> String {
        self.model.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_model(&mut self, model: String) {
        self.model = model;
    }

    #[wasm_bindgen(getter)]
    pub fn flash_found(&self) -> String {
        self.flash_found.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_flash_found(&mut self, flash_found: String) {
        self.flash_found = flash_found;
    }

    #[wasm_bindgen(getter)]
    pub fn gps(&self) -> String {
        self.gps.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_gps(&mut self, gps: String) {
        self.gps = gps;
    }
    #[wasm_bindgen(getter)]
    pub fn altitude(&self) -> String {
        self.altitude.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_altitude(&mut self, altitude: String) {
        self.altitude = altitude;
    }
    #[wasm_bindgen(getter)]
    pub fn description(&self) -> String {
        self.description.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_description(&mut self, description: String) {
        self.description = description;
    }

    #[wasm_bindgen(getter)]
    pub fn copyright(&self) -> String {
        self.copyright.clone()
    }
    #[wasm_bindgen(setter)]
    pub fn set_copyright(&mut self, copyright: String) {
        self.copyright = copyright;
    }
}

///////////////////////////////////////////////////////////////////////////////
/// Logging helper JS  function
///////////////////////////////////////////////////////////////////////////////

// Javascript Debug tools
#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);

}
