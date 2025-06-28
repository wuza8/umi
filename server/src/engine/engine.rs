use std::{process::Command, sync::LazyLock, thread};

use super::workflow::{Workflow, WorkflowRunner, WorkflowTemplate, WorkflowTemplateParser};

pub struct Engine {
    pub workflow_templates: Vec<WorkflowTemplate>,
    pub running_workflows: Vec<Workflow>
}

impl Engine{
    pub fn new()->Self{
        Self{
            workflow_templates: WorkflowTemplateParser::parse_workflows("./workflows").unwrap(),
            running_workflows: Vec::new()
        }
    }
    
    fn find_workflow_template(&self, name: &str) -> Option<WorkflowTemplate>{
        for workflow in &self.workflow_templates{
            if workflow.workflow_systemname == name {
                return Some(workflow.clone());
            }
        }
        None
    }

    pub fn run_workflow(&mut self, workflow_systemname: &str){
        let workflow_template = self.find_workflow_template(workflow_systemname);
        
        match workflow_template{
            Some(workflow_template) => {
                let new_workflow = WorkflowRunner::create_workflow(&workflow_template);
                let script_path = String::from("./workflows/") + &new_workflow.stages[0].script.clone();
                let workflow_uuid =new_workflow.workflow_id.clone();
                self.running_workflows.push(new_workflow);
                thread::spawn(move || {
                    let result = Command::new("python").arg(script_path).arg(workflow_uuid.to_string()).arg("http://127.0.0.1:2138/script").status();
                    println!("Stage run! {:?}", result);
                });
            },
            None => {
                println!("Couldn't run workflow! Workflow with name {} not found!", workflow_systemname);
            }
        }
    }

    pub fn get_available_workflows(&mut self) -> Vec<WorkflowTemplate> {
        //TODO: Add cache
        let workflows = WorkflowTemplateParser::parse_workflows("./workflows").unwrap();
        return workflows;
    }

}

pub static ENGINE: LazyLock<std::sync::Mutex<Engine>> = LazyLock::new(|| std::sync::Mutex::new(Engine::new()));
