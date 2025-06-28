import { Component } from "react";
import "./App.css";
import { AppContext, AppStateType } from "./context";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainPage } from "./MainPage";
import { AddConnection } from "./essential/StartPage/addConnection";
import { NewTask } from "./essential/Tasks/newTask";
import AddProject from "./essential/StartPage/addProject"; // Use default import
import LLMProviderPopup from "./essential/StartPage/LLMProviderPopup";


export class Program extends Component {
  // Przypisanie kontekstu do contextType
  static contextType = AppContext;
  declare context: AppStateType; // Użycie `declare` zamiast `context!`

  render() {
      return (
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/add-connection" element={<AddConnection />} />
            <Route path="/new-task" element={<NewTask />} />
            <Route path="/add-project" element={<AddProject />} /> 
            <Route path="/server-settings" element={<LLMProviderPopup />} /> 
          </Routes>
        </Router>
      );
  }
}

// export function App(){
//   const { state } = useAppContext();
//   return <h1>{state.folder_path}</h1>; 
// }
