import { Component } from "react";
import { AppContext, AppStateType } from "../../context";
import "./editor.css"
import CodeEditor from "../codeEditor";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";


export class EditorPage extends Component {
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    state = {
      codelist: [] as String[],
      opened_name: "",
      opened_content: "",
    }

    codeListEventHandler : UnlistenFn | null = null;
    singleCodeEventHandler : UnlistenFn | null = null;

    async componentDidMount() {

      this.codeListEventHandler = await listen('CodeList', (event) => {
        this.setState({
          ...this.state,
          codelist: JSON.parse(event.payload as string).CodeList!.codelist
        })
      });

      this.singleCodeEventHandler = await listen('WantedCode', (event) => {
        let code = JSON.parse(event.payload as string).WantedCode!;
        this.setState({
          ...this.state,
          opened_name: code.name,
          opened_content: code.content,
        })
      });

      await invoke('get_code_list');
    }

    async componentWillUnmount() {

      if (this.codeListEventHandler != null)
        this.codeListEventHandler();

      if (this.singleCodeEventHandler != null)
        this.singleCodeEventHandler();
      
    }

    async openFile(filename : String){
      await invoke('get_code', {documentName: filename});
    }
  
  
    render() {
        const { codelist, opened_name, opened_content } = this.state;

        console.log(opened_content)
  
        return (
          <div id="content">
            <div id="left-side">
              <div id="left-side-header">
                <div id="left-side-header-caption">Files on <span className="left-side-header-projectname">sample project</span></div>
              </div>
              <div id="left-side-content">
                {codelist.map((doc) => (
                  <div className="editor-file-button" onClick={() => {this.openFile(doc)}}>
                    {doc}
                  </div>
                ))}
              </div>
            </div>
            <div id="right-side">
              <div className="right-side-footer">
                {opened_name}
              </div>
              <CodeEditor initialCode={opened_content}></CodeEditor>
            </div>
          </div>
        );
    }
  }