import { Component } from "react";
import { AppContext, AppStateType, Workflow } from "../../context";
import { invoke } from "@tauri-apps/api/core";
import "./chatbot.css"
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export class ChatBotPage extends Component {
  static contextType = AppContext;
  declare context: AppStateType;

  state = {
    workflows: [] as Workflow[],
    message: "",
    active_workflow_id: ""
  };

  async runSimpleChat() {
    await invoke('run_workflow', { workflowName: "default_simple_chat" });
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: event.target.value });
  };

  sendToChatbot = async () => {
    try {
      const { message, active_workflow_id } = this.state;
      await invoke<string>("send_chatbot_message", {workflowId: active_workflow_id,message });
      this.setState({
        ...this.state,
        message: ""
      })
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
    }
  };

  changeActiveWorkflow = async (workflow_id: String) => {
    console.log(workflow_id);
    this.setState({...this.state, active_workflow_id: workflow_id });
  };

  async getWorkflows() : Promise<Workflow[]>{
    try {
        const workflows = await invoke<Workflow[]>('get_workflows');
        console.log('Retrieved workflows:', workflows);
        return workflows;
    } catch (error) {
        console.error('Failed to get connections:', error);
        return [];
    }
}

intervalId: number | null = null; // Store the interval ID
runningWorkflowsEventHandler: UnlistenFn | null = null;

async componentDidMount() {
  // const { state, setState } = this.context; 
  // const workflows = await this.getWorkflows();
  // setState({...state, workflows: workflows });

  this.runningWorkflowsEventHandler = await listen('RunningWorkflows', (event) => {
      this.setState({
        ...this.state,
        workflows: JSON.parse(JSON.parse(event.payload as string).RunningWorkflows!.workflows)
      })
    });
    await invoke('get_workflows');
  }

  openNewTaskWindow() {
    // Tworzenie nowego okna
    const newWindow = new WebviewWindow('add-connection-window', {
      title: 'New task',
      width: 900,
      height: 600,
      url: '/new-task', // Ścieżka, do której nowe okno ma nawigować
      resizable: true,
      maximizable: true,
      minimizable: false,
      center:true
    });
  }

  componentWillUnmount() {
    // Clear the interval when the component unmounts
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.runningWorkflowsEventHandler != null)
      this.runningWorkflowsEventHandler()
  }

  render() {
    const { message, workflows, active_workflow_id } = this.state;

    return (
      <div id="content">
        <div id="left-side-omg">
          <div className="button-newtask" onClick={()=>this.runSimpleChat()}>+ New simple chat</div>
          <div className="button-newtask" onClick={()=>this.openNewTaskWindow()}>New task</div>
          <div id="left-side">
          <div id="latest-tasks-place">
            {workflows.map((workflow) => (
              <div className={active_workflow_id == workflow.workflow_id ? "latest-task-button button-clicked" : "latest-task-button"} onClick={() => this.changeActiveWorkflow(workflow.workflow_id)}>
                <div className="task-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>

                </div>
                <div className="task-name">{workflow.workflow_name}</div>
              </div>
            ))}
          </div>
        </div>
        </div>

        

        <div id="right-side">
          <div id="chat-content">
          {workflows.filter((w) => w.workflow_id == active_workflow_id)[0] !== undefined && workflows.filter((w) => w.workflow_id == active_workflow_id)[0].chat_history.map((chat_message)=>(
                <div className={"chat-message chat-message-"+chat_message.sender.toString().toLowerCase()} dangerouslySetInnerHTML={{ __html: chat_message.content }} >
                </div>
          ))}
          </div>
          {active_workflow_id != "" && <div id="chat-writing-window">
            <input 
              type="text" 
              id="chat-input"
              value={message} 
              onChange={this.handleInputChange} 
              placeholder="Type your message here..."
            />
            <div id="chat-button" onClick={this.sendToChatbot}>Submit</div>
        </div>}
        </div>
        
      </div>
    );
  }
}