use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

// Define a struct for individual messages in the request
#[derive(Serialize, Deserialize, Clone)]
pub struct Message {
    role: String,
    content: String,
}

// Define the complete request model for GPT4All
#[derive(Serialize, Deserialize)]
pub struct ChatRequest {
    model_name: String,
    messages: Vec<Message>,
}

// Define the Gpt4AllClient with thread-safe configuration
pub struct ChatBotClient {
    api_url: Arc<Mutex<String>>,
    model_name: Arc<Mutex<String>>,
    client: Client,
    messages: Arc<Mutex<Vec<Message>>>,
}

impl ChatBotClient {
    // Constructor with default settings
    pub fn new(api_url: &str, model_name: &str) -> Self {
        Self {
            api_url: Arc::new(Mutex::new(api_url.to_string())),
            model_name: Arc::new(Mutex::new(model_name.to_string())),
            client: Client::new(),
            messages: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn create_new_conversation(&self) -> ChatBotClient{
        ChatBotClient::new(self.api_url.lock().as_ref().unwrap(), self.model_name.lock().as_ref().unwrap())
    }

    // Method to update the API URL
    pub fn set_api_url(&self, api_url: &str) {
        let mut url = self.api_url.lock().unwrap();
        *url = api_url.to_string();
    }

    // Method to update the model name
    pub fn set_model_name(&self, model_name: &str) {
        let mut name = self.model_name.lock().unwrap();
        *name = model_name.to_string();
    }

    // Method to add a message to the conversation
    pub fn add_message(&self, role: &str, content: &str) {
        let mut messages = self.messages.lock().unwrap();
        messages.push(Message {
            role: role.to_string(),
            content: content.to_string(),
        });
    }

    // Method to clear all messages (useful for resetting conversation)
    pub fn clear_messages(&self) {
        let mut messages = self.messages.lock().unwrap();
        messages.clear();
    }

    // Method to send a request to the GPT4All API
    pub async fn send_request(&self) -> Result<String, reqwest::Error> {
        // Build the request payload
        let model_name = self.model_name.lock().unwrap().clone();
        let messages = self.messages.lock().unwrap().clone();
        let request_body = ChatRequest {
            model_name,
            messages,
        };

        // Get the API URL
        let api_url = self.api_url.lock().unwrap().clone();

        // Send the request
        let response = self
            .client
            .post(&api_url)
            .json(&request_body)
            .send()
            .await?
            .text()
            .await?;

        Ok(response)
    }
}