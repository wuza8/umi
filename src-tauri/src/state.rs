use std::{cell::Cell, env, path::Path, process::Command, sync::{atomic::{AtomicBool, Ordering}, Mutex}};

use serde::Serialize;
use sqlx::SqlitePool;

use crate::{server_client::{ProjectInfo, ServerClient}, websocket_manager::WebSocketManager};

pub struct AppState {
    // pub chatbot: ChatBotClient,
    pub server_client: ServerClient,
    pub database: SqlitePool,
    pub ws_man : WebSocketManager,
    pub local_server: AtomicBool,
}

#[derive(Serialize)]
pub struct ServerInformation{
    server_name: String,
    online: bool,
    hosted_projects: Vec<ProjectInfo>,
}

#[derive(Serialize)]
pub struct ServerConnection{
    id: i64,
    name: String,
    url: String
}

impl AppState {
    pub async fn add_connection(&self, name: &str, url: &str) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "INSERT INTO connections (name, url) VALUES (?, ?)",
            name,
            url
        )
        .execute(&self.database)
        .await?;
        Ok(())
    }

    pub async fn get_connections(&self) -> Result<Vec<ServerConnection>, sqlx::Error> {
        let connections = sqlx::query!(
            "SELECT id, name, url FROM connections"
        )
        .fetch_all(&self.database)
        .await?;
        let result: Vec<ServerConnection> = connections.into_iter()
            .map(|conn| ServerConnection {
                id: conn.id,
                name: conn.name,
                url: conn.url,
            })
            .collect();
        Ok(result)
    }

    pub async fn get_server_info(&self, connection_id: i64)-> Result<ServerInformation, sqlx::Error>{
        let connection = sqlx::query!(
            "SELECT id, name, url FROM connections where id=?",
            connection_id
        )
        .fetch_one(&self.database)
        .await?;

        Ok(ServerInformation {
            server_name: connection.name,
            online: ServerClient::new(connection.url.as_str()).ping().await,
            hosted_projects: match ServerClient::new(connection.url.as_str()).get_project_list().await {
                Some(e) => e,
                None => Vec::new()
            }
        })
    }
    pub async fn connect_to_project(&self, connection_id: i64, project_name: String)-> Result<bool, sqlx::Error>{
        let connection = sqlx::query!(
            "SELECT id, name, url FROM connections where id=?",
            connection_id
        )
        .fetch_one(&self.database)
        .await?;

        self.server_client.set_url(String::from(&connection.url));
        self.server_client.choose_project(project_name).await;

        self.ws_man.connect(connection.url.as_str()).await;

        Ok(true)
    }

    pub async fn is_local_server_running(&self) -> bool {
        if self.local_server.load(Ordering::Relaxed) {
            return true;
        }
        ServerClient::new("http://127.0.0.1:2138").ping().await
    }

    pub async fn connect_local(&self)-> Result<bool, sqlx::Error>{
        if !self.is_local_server_running().await {
            self.local_server.store(true, Ordering::Relaxed);
            let current_dir = env::current_dir().expect("nie udało się pobrać bieżącego katalogu");
            println!("Program został uruchomiony z: {}", current_dir.display());

            
            let mut command = Command::new("cargo");
            command.arg("run");
            command.current_dir(current_dir.join(Path::new("../server")));
            command.spawn().expect("Failed to start server");
        }
        else {
            println!("Local server already running!");
        }
        self.server_client.set_url(String::from("http://127.0.0.1:2138"));
        self.server_client.choose_project("local".to_string()).await;

        self.ws_man.connect("http://127.0.0.1:2138").await;

        Ok(true)
    }
}