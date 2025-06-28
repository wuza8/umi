import { Component } from "react";
import { AppContext, AppStateType, Workflow } from "../../context";
import "./tasks.css"
import MarkdownRenderer from "../markdownRenderer";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

export class NewTask extends Component {
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    state = {
      workflow_templates: [],
      chosen_workflow: {workflow_name: "No workflow chosen!", markdown_content:"Choose a workflow from the list.", workflow_systemname: "none"}
    };

    workflowTemplatesEventHandler : UnlistenFn | null = null;

    async componentDidMount() {

      this.workflowTemplatesEventHandler = await listen('WorkflowTemplates', (event) => {
        this.setState({
          ...this.state,
          workflow_templates: JSON.parse(event.payload as string).WorkflowTemplates!.workflows
        })
      });

      await invoke('get_workflow_templates');
    }

    async componentWillUnmount() {
      if (this.workflowTemplatesEventHandler != null)
        this.workflowTemplatesEventHandler();
    }

    chooseWorkflow(i :number){
      this.setState({
        ...this.state,
        chosen_workflow: this.state.workflow_templates[i]
      })
    }

    async runChoosenWorkflow(){
      await invoke('run_workflow', { workflowName: this.state.chosen_workflow.workflow_systemname });
      getCurrentWindow().close();
    }

    render() {
        return (
          <div id="newtask-content">
            <div id="left-side" className="newtask-left-side">
              <div id="left-side-header" >
                <div id="left-side-header-caption">New task on <span className="left-side-header-projectname">sample project</span></div>
              </div>
              <div id="left-side-content">
              {this.state.workflow_templates.map((wtemplates, i) => (
                <div className={wtemplates.workflow_name == this.state.chosen_workflow.workflow_name ? "editor-file-button button-clicked" : "editor-file-button"} onClick={() => this.chooseWorkflow(i)}>
                    {wtemplates.workflow_name}
                </div>
              ))}
              </div>
            </div>
            <div id="right-side" className="newtask-right-side">
              <div id="newtask-right-footer">
                <div id="newtask-task-name">{this.state.chosen_workflow.workflow_name}</div>
                <div id="newtask-button-places">
                    <div className="newtask-button" onClick={() => this.runChoosenWorkflow()}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                        </svg>
                    </div>
                </div>
              </div>
              <div>
                <MarkdownRenderer content={this.state.chosen_workflow.markdown_content}></MarkdownRenderer>
              </div>
            </div>
          </div>
        );
    }
  }