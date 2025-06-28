import { Component } from "react";
import { AppContext, AppStateType } from "../../context";
import "./tasks.css"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export class TasksPage extends Component {
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

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
  
      newWindow.once('tauri://created', () => {
        console.log('Nowe okno zostało utworzone');
      });
  
      newWindow.once('tauri://error', (error) => {
        console.error('Wystąpił błąd podczas tworzenia okna:', error);
      });
    };
  
    render() {
        const { state } = this.context; // Dostęp do `state` z kontekstu
  
        return (
          <div id="content">
            <div id="left-side">
              <div id="left-side-header">
                <div id="left-side-header-caption">Task history on <span className="left-side-header-projectname">sample project</span></div>
                <div id="left-side-header-button" onClick={()=>this.openNewTaskWindow()}>+ New task</div>
              </div>
              <div id="left-side-content">
                <div className="button-clicked task-button">
                  <div className="task-button-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
                  </div>
                  <div className="task-button-title">
                    Create a brief document
                  </div>
                  <div className="task-button-progress">
                    In progress...
                  </div>
                </div>
                <div className="task-button">
                  <div className="task-button-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
                  </div>
                  <div className="task-button-title">
                    Create a brief document
                  </div>
                  <div className="task-button-progress">
                    In progress...
                  </div>
                </div>
              </div>
            </div>
            <div id="right-side">
              
            </div>
          </div>
        );
    }
  }