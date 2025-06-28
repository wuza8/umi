mod apis;
mod engine;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

use std::fs;
use std::io;

fn list_file_names(path: &str) -> io::Result<Vec<String>> {
    let mut file_names = Vec::new();  // Create an empty vector to store file names

    let entries = fs::read_dir(path)?;  // Get directory entries

    for entry in entries {
        let entry = entry?;  // Get the actual entry (file or folder)
        let path = entry.path();  // Get the path of the entry

        if path.is_file() {  // Check if the entry is a file
            if let Some(file_name) = path.file_name() {  // Get the file name
                file_names.push(file_name.to_string_lossy().into_owned());  // Push the file name to the vector
            }
        }
    }

    Ok(file_names)
}

#[derive(Serialize)]
struct Project {
    project_name: String,
    project_path: String,
}

// Endpoint: GET /ping
async fn ping() -> impl Responder {
    HttpResponse::Ok().body("pong")
}

// Endpoint: GET /projects
async fn get_projects() -> impl Responder {
    let projects = vec![
        Project {
            project_name: "Project Test".to_string(),
            project_path: "/home/user/project".to_string(),
        }
    ];

    HttpResponse::Ok().json(projects)
}



#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/ping", web::get().to(ping))
            .route("/projects", web::get().to(get_projects))
            .route("/ws", web::get().to(apis::websocket_api::websocket_handler))
            .route("/script", web::post().to(apis::script_api::script_command))
    })
    .bind("127.0.0.1:2138")?
    .run()
    .await
}