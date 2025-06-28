use std::{fs::{self, File}, io::Write};

use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;

use crate::{apis::websocket_api::{SystemEvent, WS_SESSION}, engine::{engine::ENGINE, workflow::{ChatMessage, Code, Document, DocumentToRead}}};

#[derive(Deserialize, Debug)]
enum ScriptCommand{
    AddChatMessage(ChatMessage),
    GetNextMessage,
    WriteDocument(Document),
    ReadDocument(DocumentToRead),
    WriteCode(Code)
}

#[derive(Deserialize, Debug)]
pub struct ScriptRequest {
    script_id: String,
    command: ScriptCommand,
}

pub async fn script_command(script: web::Json<ScriptRequest>) -> impl Responder {
    match script.command {
        ScriptCommand::GetNextMessage => {}
        _ => {
            println!("Received script_id: {}, command: {:?}", script.script_id, script.command);
        }
        
    }
    
    // Here you can add logic to process the script
    // Example: Call a Python script or handle the command
    let mut state = ENGINE.lock().unwrap();
    let workflow = state.running_workflows.iter_mut().find(|a| a.workflow_id == script.script_id);

    if workflow.is_none() {
        return HttpResponse::Ok().json({
            serde_json::json!({
                "status": "Error",
                "message": "Bad ID"
            })
        })
    }

    let workflow = workflow.unwrap();
    
    match &script.command{
        ScriptCommand::AddChatMessage(message) => {
            workflow.chat_history.push(message.clone());
            let session: std::sync::MutexGuard<'_, Option<actix::Addr<crate::apis::websocket_api::WebSocketSession>>> = WS_SESSION.lock().unwrap();
            session.as_ref().unwrap().do_send(SystemEvent::UpdateWorkflows);
        }
        ScriptCommand::GetNextMessage => {
            let message = workflow.awaiting_user_message.clone();
            workflow.awaiting_user_message = None;
            return HttpResponse::Ok().json({
                serde_json::json!({
                    "status": "success",
                    "message": message
                })
            });
        },
        ScriptCommand::WriteDocument(document) =>{
            let mut file = File::create("/home/user/project/umidocs/".to_string()+document.name.as_str()+".md").unwrap(); 
            file.write_all(document.content.as_bytes()).unwrap();  
        },
        ScriptCommand::ReadDocument(document) =>{
            let content = fs::read_to_string("/home/user/project/umidocs/".to_string()+document.name.as_str()+".md").unwrap(); 
            return HttpResponse::Ok().json({
                serde_json::json!({
                    "status": "success",
                    "content": content
                })
            });
        },
        ScriptCommand::WriteCode(code) =>{
            let mut file = File::create("/home/user/project/code/".to_string()+code.name.as_str()).unwrap(); 
            file.write_all(code.content.as_bytes()).unwrap();
        },
    }
    
    HttpResponse::Ok().json({
        serde_json::json!({
            "status": "success",
            "message": format!("Script {} executed with command '{:?}'", script.script_id, script.command)
        })
    })
}