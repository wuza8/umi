import { Component } from "react";
import { AppContext, AppStateType } from "../context";

export class SystemPage extends Component {
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`
  
    render() {
        const { state } = this.context; // Dostęp do `state` z kontekstu
  
        return (
          <div id="content">
            <textarea>asdsadasd</textarea>    
          </div>
        );
    }
  }