mod server_client;
mod websocket_manager;
mod state;

use std::{env, path::Path, process::Command, sync::{atomic::AtomicBool, Mutex}};

use serde::{Deserialize, Serialize};
use server_client::ServerClient;
use sqlx::sqlite::SqlitePool;
use state::{AppState, ServerConnection, ServerInformation};
use tauri::AppHandle;
use websocket_manager::WebSocketManager;
use once_cell::sync::Lazy;

static APP_HANDLE: Lazy<std::sync::Mutex<Option<AppHandle>>> = Lazy::new(|| std::sync::Mutex::new(None));

// Store the AppHandle globally
fn set_app_handle(app: &AppHandle) {
    let mut handle = APP_HANDLE.lock().unwrap();
    *handle = Some(app.clone());
}

// Get the AppHandle globally
pub fn get_app_handle() -> Option<AppHandle> {
    let handle = APP_HANDLE.lock().unwrap();
    handle.clone()
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum WorkflowType {
    Unknown,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum ChatRole {
    User,
    Assistant,
    System,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChatMessage {
    pub role: ChatRole,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum SubtaskStatus {
    Waiting,
    InProgress,
    Done,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Subtask {
    pub name: String,
    pub status: SubtaskStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Workflow {
    pub id: u64,
    pub name: String,
    pub workflow_type: WorkflowType, // `r#type` is used to avoid keyword conflict.
    pub chat_history: Vec<ChatMessage>,
    pub task_history: Vec<ChatMessage>,
    pub attached_script_id: u32,
    pub task_todo_list: Vec<Subtask>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn close(window: tauri::Window) {
    window.close().unwrap();
}

#[tauri::command]
fn minimize(window: tauri::Window) {
    window.minimize().unwrap();
}

#[tauri::command]
fn maximize(window: tauri::Window) {
    window.maximize().unwrap();
}


#[derive(Serialize, Deserialize, Debug)]
pub enum Event {
    // An event for sending a text message
    TextMessage(TextMessage),
    GetWorkflowTemplates,
    RunWorkflow(String),
    GetRunningWorkflows,
    SendNewMessage(String, String),
    GetDocumentList,
    GetDocument(String),
    GetCodeList,
    GetCode(String),
}

// Struct for a simple text message
#[derive(Serialize, Deserialize, Debug)]
pub struct TextMessage {
    pub workflow_id: String,
    pub content: String,
}

#[tauri::command]
async fn send_chatbot_message(state: tauri::State<'_, AppState>,workflow_id: &str, message : &str) -> Result<String, String>{
    // let chatbot = state.chatbot.create_new_conversation();

    // chatbot.add_message("user", message);
    // Ok(match chatbot.send_request().await {
    //     Ok(res) => res,
    //     Err(_) => String::from("error")
    // })
    println!("Sended! {}", message);
    state.ws_man.send_message(serde_json::to_string(&Event::SendNewMessage(String::from(workflow_id), String::from(message))).unwrap().as_str()).await;

    Ok(String::from("ok"))
}

#[tauri::command]
async fn get_workflow_templates(state: tauri::State<'_, AppState>) -> Result<String, String>{
    state.ws_man.send_message(serde_json::to_string(&Event::GetWorkflowTemplates).unwrap().as_str()).await;
    Ok(String::from("ok"))
}

// initialize sqlite in file
pub async fn init_sqlite() -> Result<SqlitePool, sqlx::Error> {
    // Create a connection pool to the SQLite database file
    let pool = SqlitePool::connect("example.db").await?;

    // Initialize your database schema here (e.g., creating tables)
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS connections (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL
        )"
    ).execute(&pool).await?;

    Ok(pool)
}

#[tauri::command]
async fn add_connection(name: String, url: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    println!("Add connection! {:?}", name);
    
    match state.add_connection(&name, &url).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to add connection: {}", e)),
    }
}

#[tauri::command]
async fn get_connections(state: tauri::State<'_, AppState>) -> Result<Vec<ServerConnection>, String> {
    match state.get_connections().await {
        Ok(connections) => Ok(connections),
        Err(e) => Err(format!("Failed to get connections: {}", e)),
    }
}

#[tauri::command]
async fn get_server_info(state: tauri::State<'_, AppState>, connection_id: i64) -> Result<ServerInformation, String> {
    match state.get_server_info(connection_id).await {
        Ok(connections) => Ok(connections),
        Err(e) => Err(format!("Failed to get connections: {}", e)),
    }
}

#[tauri::command]
async fn connect_to_project(state:  tauri::State<'_, AppState>, connection_id: i64, project_name: String) -> Result<bool, String> {
    match state.connect_to_project(connection_id, project_name).await {
        Ok(connections) => Ok(connections),
        Err(e) => Err(format!("Failed to get connections: {}", e)),
    }
}

#[tauri::command]
async fn run_local(state:  tauri::State<'_, AppState>) -> Result<bool, String> {
    //Run the local server from ./server with cargo run
    let current_dir = env::current_dir().expect("nie udało się pobrać bieżącego katalogu");
    println!("Program został uruchomiony z: {}", current_dir.display());

    
    let mut command = Command::new("cargo");
    command.arg("run");
    command.current_dir(current_dir.join(Path::new("../server")));
    command.spawn().expect("Failed to start server");

    match state.connect_local().await {
        Ok(connections) => Ok(connections),
        Err(e) => Err(format!("Failed to get connections: {}", e)),
    }
}

#[tauri::command]
async fn get_workflows(state: tauri::State<'_, AppState>) -> Result<(), String>{
    state.ws_man.send_message(serde_json::to_string(&Event::GetRunningWorkflows).unwrap().as_str()).await;
    Ok(())
}

#[tauri::command]
async fn get_document_list(state: tauri::State<'_, AppState>) -> Result<(), String>{
    state.ws_man.send_message(serde_json::to_string(&Event::GetDocumentList).unwrap().as_str()).await;
    Ok(())
}

#[tauri::command]
async fn get_document(state: tauri::State<'_, AppState>, document_name : &str) -> Result<(), String>{
    state.ws_man.send_message(serde_json::to_string(&Event::GetDocument(document_name.to_string())).unwrap().as_str()).await;
    Ok(())
}

#[tauri::command]
async fn get_code_list(state: tauri::State<'_, AppState>) -> Result<(), String>{
    state.ws_man.send_message(serde_json::to_string(&Event::GetCodeList).unwrap().as_str()).await;
    Ok(())
}

#[tauri::command]
async fn get_code(state: tauri::State<'_, AppState>, document_name : &str) -> Result<(), String>{
    state.ws_man.send_message(serde_json::to_string(&Event::GetCode(document_name.to_string())).unwrap().as_str()).await;
    Ok(())
}


#[tauri::command]
async fn run_workflow(state: tauri::State<'_, AppState>, workflow_name: String) -> Result<(), String> {
  println!("Need to run workflow {}",workflow_name);
  state.ws_man.send_message(serde_json::to_string(&Event::RunWorkflow(workflow_name)).unwrap().as_str()).await;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .manage(AppState {
            // chatbot: ChatBotClient::new("http://localhost:1234/v1/chat/completions", "llama-3.2-1b-instruct"),
            server_client: ServerClient::new(""),
            database: init_sqlite().await.unwrap(),
            ws_man: WebSocketManager::new(),
            local_server: AtomicBool::new(false),
        })
        .setup(|app|{
            set_app_handle(app.handle());

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet,minimize, maximize,close, send_chatbot_message, add_connection, get_connections, get_server_info, connect_to_project, get_workflows, get_workflow_templates,run_workflow,get_document_list, get_document, get_code_list, get_code, run_local])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
