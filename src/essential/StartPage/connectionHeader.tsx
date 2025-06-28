import { Component } from "react";
import { AppContext, AppPage, AppStateType } from "../../context";
import { WithTranslation, withTranslation } from 'react-i18next';
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

type ProjectInfo = {
    project_name: string;
    project_path: string;
  }
  
  type ServerInformation = {
    server_name: string;
    online: boolean;
    hosted_projects: ProjectInfo[];
  }
  

  type MyComponentProps = {
    children: any;
    connection_id: number;
  } & WithTranslation; 

class ConnectionHeader extends Component<MyComponentProps> {

    state = {
        loaded: false,
        online: false,
        projects: []
    }
    
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    async getServerInfo(conn_id : number) : Promise<ServerInformation> {
        return invoke('get_server_info',{connectionId: conn_id})
    }

    async loadData(){
        const { connection_id } = this.props; 

        const info = await this.getServerInfo(connection_id)

        this.setState({
            ...this.state,
            loaded: true,
            online: info.online,
            projects: info.hosted_projects
        });
         
        console.log("data loading")
    }

    openAddProjectWindow() {
        console.log("bleh")
        // Creating a new window for adding a project
        const newWindow = new WebviewWindow('add-project-window', {
            title: 'Add Project',
            width: 500,
            height: 300,
            url: '/add-project', // Path to the new project view
            resizable: false,
            maximizable: false,
            minimizable: false,
            center: true
        });

        newWindow.once('tauri://created', () => {
            console.log('New project window created');
        });

        newWindow.once('tauri://error', (error: any) => {
            console.error('Error creating project window:', error);
        });
    }

    openServerSettingsWindow() {
        console.log("bleh")
        // Creating a new window for adding a project
        const newWindow = new WebviewWindow('add-project-window', {
            title: 'Server settings',
            width: 500,
            height: 300,
            url: '/server-settings', // Path to the new project view
            resizable: false,
            maximizable: false,
            minimizable: false,
            center: true
        });

        newWindow.once('tauri://created', () => {
            console.log('New project window created');
        });

        newWindow.once('tauri://error', (error: any) => {
            console.error('Error creating project window:', error);
        });
    }

    async componentDidMount() {
    // Pobierz dane połączeń przy montowaniu komponentu
        this.loadData()
    }

    async open_project(name : string){
        const { connection_id } = this.props;
        const { state, setState } = this.context;

        await invoke('connect_to_project', { connectionId: connection_id, projectName: name });

        setState({...state,
            is_opened: true,
            opened_page: AppPage.ChatBot
        })
    }
  
    render() {
        const { children } = this.props;

        if(!this.state.loaded){
            return (
            <div className="connection-header">
                <div className="flex ">
                    <div className="f-left table-connections-conname"> {children} </div>
                    <div className="f-left ml-10"><div className="f-left butt butt-small butt-with-img">
                        <div className="butt-icon butt-icon-small"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> 
                        </svg></div>
                        Loading...</div>
                    </div>
                </div>
            </div>
            )
        }

        return (
        <div className="connection-header">
            <div className="flex ">
                <div className="f-left table-connections-conname"> {children} <span className={this.state.online ? "table-connections-conline" : "table-connections-coffline"}> {this.state.online ? "online" : "offline"}</span></div>
                {this.state.online && (<div className="f-left ml-10"><div onClick={()=>{this.openAddProjectWindow()}} className="f-left butt butt-small butt-with-img">
                    <div className="butt-icon butt-icon-small" ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> 
                    </svg></div>
                    New project</div>
                </div>)}
                <div className="f-left ml-10"><div className="f-left butt butt-small">Configure connection</div>
                </div>
                {this.state.online && (<div className="f-left ml-10"><div className="f-left butt butt-small" onClick={() => this.openServerSettingsWindow()}>Server settings</div>
                </div>)}
            </div>
            <div className="table-main">
            {this.state.projects.length == 0 && this.state.online == true && (
                <span>
                    No projects found...
                </span>
            )}
            
            {this.state.projects.map((project : ProjectInfo, index) => (
                <div className="table-row" key={index} onClick={() => this.open_project(project.project_name)}>
                    {project.project_name} &nbsp;&nbsp;&nbsp;&nbsp; {project.project_path}
                </div>
                ))}
            </div>
        </div>
        );
    }
  }

  // Export withTranslation HOC to inject i18n props
export default withTranslation()(ConnectionHeader);