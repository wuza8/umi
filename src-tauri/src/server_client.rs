use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};


// Define the Gpt4AllClient with thread-safe configuration
pub struct ServerClient {
    server_url: Arc<Mutex<String>>,
    client: Client,
}

#[derive(Serialize,Deserialize)]
pub struct ProjectInfo{
    project_name: String,
    project_path: String,
}

impl ServerClient {
    // Constructor with default settings
    pub fn new(server_url: &str) -> Self {
        Self {
            server_url: Arc::new(Mutex::new(server_url.to_string())),
            client: Client::new(),
        }
    }

    // Method to send a request to the GPT4All API
    // pub async fn send_request(&self) -> Result<String, reqwest::Error> {
    //     // Build the request payload
    //     let model_name = self.model_name.lock().unwrap().clone();
    //     let messages = self.messages.lock().unwrap().clone();
    //     let request_body = ChatRequest {
    //         model_name,
    //         messages,
    //     };

    //     // Get the API URL
    //     let api_url = self.server_url.lock().unwrap().clone();

    //     // Send the request
    //     let response = self
    //         .client
    //         .post(&api_url)
    //         .json(&request_body)
    //         .send()
    //         .await?
    //         .text()
    //         .await?;

    //     Ok(response)
    // }

    pub fn set_url(&self, url : String){
        let mut old_url = self.server_url.lock().expect("Failed to lock Mutex");
        *old_url = String::from(url);
    }

    pub async fn ping(&self) -> bool {
        // Get the API URL
        let api_url = self.server_url.lock().unwrap().clone();

        // Send the request
        let response = self
            .client
            .get( String::from(&api_url) + "/ping")
            .send()
            .await;

        match response {
            Ok(_) => true,
            Err(_) => false
        }
    }

    pub async fn choose_project(&self, project_name: String) -> bool {
        // Get the API URL
        let api_url = self.server_url.lock().unwrap().clone();

        // Send the request
        let response = self
            .client
            .post( String::from(&api_url) + "/choose-project")
            .send()
            .await;

        match response {
            Ok(_) => true,
            Err(_) => false
        }
    }

    pub async fn get_project_list(&self) -> std::option::Option<Vec<ProjectInfo>> {
        // Get the API URL
        let api_url = self.server_url.lock().unwrap().clone();

        // Send the request
        let response = self
            .client
            .get( String::from(&api_url) + "/projects")
            .send()
            .await;

        match response {
            Ok(data) => {
                let server_info: Vec<ProjectInfo> = serde_json::from_str::<Vec<ProjectInfo>>(data.text().await.unwrap().as_str()).ok().unwrap();
                Some(server_info)
            },
            Err(_) => None
        }
    }
}