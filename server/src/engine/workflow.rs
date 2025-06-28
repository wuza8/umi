use serde::{Deserialize, Serialize};
use std::{fs, io};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
enum TaskStatus {
    Waiting,
    InProgress,
    Done,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Task {
    name: String,
    status: TaskStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Stage {
    stage_name: String,
    tasks: Vec<Task>,
    pub script: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkflowTemplate {
    workflow_name: String,
    pub workflow_systemname: String,
    stages: Vec<Stage>,
    markdown_content: Option<String>,
}

#[derive(Debug, Clone, Serialize,Deserialize)]
pub enum WorkflowType {
    Unknown,
}

#[derive(Debug, Clone, Serialize,Deserialize)]
pub enum Sender {
    Assistant,
    User,
    System,
}

#[derive(Debug, Clone, Serialize,Deserialize)]
pub struct ChatMessage {
    sender: Sender,
    content: String,
}

#[derive(Debug, Clone, Serialize,Deserialize)]
pub struct Document {
    pub name: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize,Deserialize)]
pub struct Code {
    pub name: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize,Deserialize)]
pub struct DocumentToRead {
    pub name: String
}

#[derive(Debug,Serialize, Deserialize)]
pub struct Workflow {
    pub workflow_id: String,
    pub workflow_name: String,
    pub workflow_systemname: String,
    pub workflow_type: WorkflowType,
    pub chat_history: Vec<ChatMessage>,
    pub task_history: Vec<String>,
    pub stages: Vec<Stage>,
    pub current_stage_index: usize,
    pub awaiting_user_message: Option<String>,
}

impl Workflow {
    fn new(workflow_name: String, workflow_systemname: String, stages: Vec<Stage>) -> Self {
        Workflow {
            workflow_id: Uuid::new_v4().to_string(),
            workflow_name,
            workflow_systemname,
            workflow_type: WorkflowType::Unknown,
            chat_history: Vec::new(),
            task_history: Vec::new(),
            stages,
            current_stage_index: 0,
            awaiting_user_message: None
        }
    }
}

pub struct WorkflowTemplateParser;

impl WorkflowTemplateParser {
    /// Parses all workflow.json files in the specified directory and its subdirectories.
    pub fn parse_workflows(base_path: &str) -> io::Result<Vec<WorkflowTemplate>> {
        let mut workflows = Vec::new();

        // Iterate over the entries in the base directory
        for entry in fs::read_dir(base_path)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                // Recursively check for workflow.json in subdirectories
                let workflow_file = path.join("workflow.json");
                let markdown_file = path.join("workflow-readme.md");

                if workflow_file.exists() {
                    let content = fs::read_to_string(&workflow_file)?;
                    let mut workflow: WorkflowTemplate = serde_json::from_str(&content)?;

                    // Optionally read the markdown content if the file exists
                    if markdown_file.exists() {
                        let markdown_content = fs::read_to_string(markdown_file)?;
                        workflow.markdown_content = Some(markdown_content);
                    } else {
                        workflow.markdown_content = None;
                    }

                    workflows.push(workflow);
                }
            }
        }

        Ok(workflows)
    }
}

pub struct WorkflowRunner;

impl WorkflowRunner {
    pub fn create_workflow(template: &WorkflowTemplate) -> Workflow {
        Workflow::new(template.workflow_name.clone(), template.workflow_systemname.clone(), template.stages.clone())
    }
}