use serde_json::Value;
use tauri::Emitter;
use url::Url;
use tokio::sync::{Mutex, mpsc};
use tokio_tungstenite::{connect_async};
use std::sync::Arc;
use tokio_tungstenite::tungstenite::Message;
use futures_util::StreamExt;
use futures_util::SinkExt;

use crate::get_app_handle;

#[derive(Clone)]
pub struct WebSocketManager {
    sender: Arc<Mutex<Option<mpsc::Sender<String>>>>,
}

impl WebSocketManager {
    pub fn new() -> Self {
        Self {
            sender: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn connect(&self, url: &str) {
        let (tx, mut rx) = mpsc::channel::<String>(32);
        *self.sender.lock().await = Some(tx);

        let mut url = String::from(url) + "/ws";
        url = url.replacen("http", "ws", 1);
        let (mut socket, _) = connect_async(url.as_str()).await.expect("Failed to connect to WebSocket");

        let (mut writer, mut reader) = socket.split();

        println!("WebSocket connected to {}", url);

        // Task to listen for incoming messages
        let sender_clone = self.sender.clone();
        tokio::spawn(async move {
            while let Some(msg) = reader.next().await {
                match msg {
                    Ok(Message::Text(text)) => {
                        // Handle incoming messages
                        WebSocketManager::handle_message(text.as_str()).await;
                    }
                    Ok(_) => println!("Received non-text message"),
                    Err(e) => {
                        eprintln!("WebSocket error: {}", e);
                        break;
                    }
                }
            }

            // Cleanup when the socket closes
            *sender_clone.lock().await = None;
            println!("WebSocket connection closed");
        });

        // Task to send outgoing messages
        tokio::spawn(async move {
            while let Some(msg) = rx.recv().await {
                if writer.send(Message::Text(msg.into())).await.is_err() {
                    eprintln!("Failed to send message, connection might be closed");
                    break;
                }
            }
        });
    }

    pub async fn send_message(&self, message: &str) {
        if let Some(sender) = &*self.sender.lock().await {
            let _ = sender.send(message.to_string()).await;
        } else {
            eprintln!("WebSocket connection not established");
        }
    }

    async fn handle_message(message: &str) {
        println!("Handling message: {}", message);
        let parsed_data: Value = serde_json::from_str(message).unwrap();
        if let Some(workflow_templates) = parsed_data.as_object() {
            if let Some(first_name) = workflow_templates.keys().next() {
                get_app_handle().unwrap().emit(first_name, message).unwrap();
            }
        }
    }
}