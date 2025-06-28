use std::fs;

use actix::{Actor, Handler, Message, StreamHandler};
use actix_web::{web, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use actix::Addr;
use crate::{engine::engine::ENGINE, list_file_names, engine::workflow::WorkflowTemplate};

// Globalny stan dla przechowywania adresu WebSocketSession
lazy_static! {
    pub static ref WS_SESSION: Mutex<Option<Addr<WebSocketSession>>> = Mutex::new(None);
}

#[derive(Clone)]
pub struct WebSocketSession{
    project_path: String,
}

impl WebSocketSession{
    pub fn get_project_path(self) -> String {
        return self.project_path.clone();
    }
}

impl Actor for WebSocketSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ReceiveEvent {
    // An event for sending a text message
    GetWorkflowTemplates,
    RunWorkflow(String),
    GetRunningWorkflows,
    SendNewMessage(String, String),
    GetDocumentList,
    GetDocument(String),
    GetCodeList,
    GetCode(String),
}

#[derive(Serialize, Deserialize)]
pub enum ResponseEvent {
    WorkflowTemplates { workflows: Vec<WorkflowTemplate> },
    RunningWorkflows { workflows: String },
    DocumentList {doclist: Vec<String>},
    CodeList {codelist: Vec<String>},
    WantedDocument {name: String, content: String},
    WantedCode {name: String, content: String},
}

#[derive(Serialize, Deserialize, Message)]
#[rtype(result = "()")]
pub enum SystemEvent {
    UpdateWorkflows
}


fn handle_event(event: ReceiveEvent, session: WebSocketSession) -> String{
    let mut engine = ENGINE.lock().unwrap();
    match event {
        ReceiveEvent::GetWorkflowTemplates => {
            let workflows = engine.get_available_workflows();
            let workflows_str = serde_json::to_string(&ResponseEvent::WorkflowTemplates { workflows:  workflows }).unwrap();
            return workflows_str;
        },
        ReceiveEvent::RunWorkflow(workflow_name) =>{
            engine.run_workflow(workflow_name.as_str());
            return "".to_string();
        },
        ReceiveEvent::GetRunningWorkflows => {
            let workflows = serde_json::to_string(&engine.running_workflows).unwrap();
            let workflows_str = serde_json::to_string(&ResponseEvent::RunningWorkflows{ workflows:  workflows }).unwrap();
            return workflows_str;
        },
        ReceiveEvent::SendNewMessage(workflow_id,message) => {
            println!("{}",message.as_str());
            let workflow = engine.running_workflows.iter_mut().find(|a| a.workflow_id == workflow_id).unwrap();
            workflow.awaiting_user_message = Some(message);
            return "".to_string();
        },
        ReceiveEvent::GetDocumentList => {
            let file_names = list_file_names((String::from(&session.get_project_path()) + "/umidocs").as_str());
            match file_names {
                Ok(file_names) => {
                    let docs_str = serde_json::to_string(&ResponseEvent::DocumentList { doclist: file_names }).unwrap();
                    return docs_str;
                },
                Err(e) => {
                    eprintln!("Error listing document files: {}", e);
                    return "".to_string();
                }
            }
            
        },
        ReceiveEvent::GetDocument(name) => {
            let content = fs::read_to_string("/home/user/project/umidocs/".to_string()+name.as_str()).unwrap();
            let doc_str = serde_json::to_string(&ResponseEvent::WantedDocument { name: name, content: content }).unwrap();
            return doc_str;
        },
        ReceiveEvent::GetCodeList => {
            let file_names = list_file_names("/home/user/project/code").unwrap();
            let docs_str = serde_json::to_string(&ResponseEvent::CodeList { codelist: file_names }).unwrap();
            return docs_str;
        },
        ReceiveEvent::GetCode(name) => {
            let content = fs::read_to_string("/home/user/project/code/".to_string()+name.as_str()).unwrap();
            let code_str = serde_json::to_string(&ResponseEvent::WantedCode { name: name, content: content }).unwrap();
            return code_str;
        }
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WebSocketSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        if let Ok(ws::Message::Text(text)) = msg {
            
            match serde_json::from_str::<ReceiveEvent>(&text) {
                Ok(event) => {
                    let result = handle_event(event, self.clone());
                    if result != "" {
                        ctx.text(result);
                    }
                }
                Err(_) => {
                    eprintln!("Failed to deserialize event");
                }
            }
        }
    }
}

impl Handler<SystemEvent> for WebSocketSession {
    type Result = ();

    fn handle(&mut self, msg: SystemEvent, ctx: &mut Self::Context) {
        match msg {
            SystemEvent::UpdateWorkflows => {
                println!("Update workflows");
                let workflows = serde_json::to_string(&ENGINE.lock().unwrap().running_workflows).unwrap();
                let workflows_str = serde_json::to_string(&ResponseEvent::RunningWorkflows{ workflows:  workflows }).unwrap();
                ctx.text(workflows_str);
            }
        }
    }
}

pub async fn websocket_handler(req: HttpRequest, stream: web::Payload) -> HttpResponse {
    let actor = WebSocketSession{project_path: "/home/user/project".to_string()};

    let (addr, res) = ws::WsResponseBuilder::new(actor, &req, stream).start_with_addr().unwrap();

    let mut ws_session = WS_SESSION.lock().unwrap();
    *ws_session = Option::Some(addr.clone());

    res
}