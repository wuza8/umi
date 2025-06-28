import { Component } from "react";
import "./App.css";
import { AppContext, AppPage, AppStateType, useAppContext } from "./context";
import { SystemPage } from "./essential/systemPage";
import Header from "./essential/Header/header";
import  StartPage  from "./essential/StartPage/startPage";
import { ChatBotPage } from "./essential/Chatbot/chatbotPage";
import { DocsPage } from "./essential/Docs/docsPage";
import { EditorPage } from "./essential/Editor/editorPage";
import { SchemaPage } from "./essential/schemaPage";
import { TasksPage } from "./essential/Tasks/tasksPage";
import { NewTask } from "./essential/Tasks/newTask";

export class MainPage extends Component {
  // Przypisanie kontekstu do contextType
  static contextType = AppContext;
  declare context: AppStateType; // Użycie `declare` zamiast `context!`

  render() {
      const { state } = this.context; // Dostęp do `state` z kontekstu

      return (
        <main>
          <Header />
          {state.opened_page == AppPage.QuickStart && <StartPage /> }
          {state.opened_page == AppPage.System && <SystemPage /> }
          {state.opened_page == AppPage.ChatBot && <ChatBotPage /> }
          {state.opened_page == AppPage.Docs && <DocsPage /> }
          {state.opened_page == AppPage.Editor && <EditorPage /> }
          {state.opened_page == AppPage.Schema && <SchemaPage /> }
          {state.opened_page == AppPage.Tasks && <TasksPage /> }
        </main>
      );
  }
}