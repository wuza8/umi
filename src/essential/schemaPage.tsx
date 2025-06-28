import { Component } from "react";
import { AppContext, AppStateType } from "../context";

export class SchemaPage extends Component {
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`
  
    render() {
        const { state } = this.context; // Dostęp do `state` z kontekstu
  
        return (
          <div id="content">
            <textarea>Schema</textarea>    
          </div>
        );
    }
  }