import { Component } from "react";
import { AppContext, AppStateType } from "../../context";
import MarkdownRenderer from "../markdownRenderer";
import "./docs.css"
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export class DocsPage extends Component {
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    state = {
      doclist: [] as String[],
      opened_name: "",
      opened_content: "",
    }

    documentListEventHandler : UnlistenFn | null = null;
    singleDocumentEventHandler : UnlistenFn | null = null;

    async componentDidMount() {

      this.documentListEventHandler = await listen('DocumentList', (event) => {
        this.setState({
          ...this.state,
          doclist: JSON.parse(event.payload as string).DocumentList!.doclist
        })
      });

      this.singleDocumentEventHandler = await listen('WantedDocument', (event) => {
        let document = JSON.parse(event.payload as string).WantedDocument!;
        this.setState({
          ...this.state,
          opened_name: document.name,
          opened_content: document.content,
        })
      });

      await invoke('get_document_list');
    }

    async componentWillUnmount() {

      if (this.documentListEventHandler != null)
        this.documentListEventHandler();

      if (this.singleDocumentEventHandler != null)
        this.singleDocumentEventHandler();
      
    }

    async openFile(filename : String){
      await invoke('get_document', {documentName: filename});
    }
  
    render() {
        const { doclist, opened_name, opened_content } = this.state;
  
        return (
          <div id="content">
            <div id="left-side">
              <div id="left-side-header">
                <div id="left-side-header-caption">Documents for <span className="left-side-header-projectname">sample project</span></div>
              </div>
              <div id="left-side-content">
                {doclist.map((doc) => (
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
              <div id="docs-content">
                <MarkdownRenderer content={opened_content}></MarkdownRenderer>
              </div>
            </div>
          </div>
        );
    }
  }