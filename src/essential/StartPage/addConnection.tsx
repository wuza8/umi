import { Component, createRef } from "react";
import { AppContext, AppStateType } from "../../context";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from "@tauri-apps/api/core";

export class AddConnection extends Component {
  // Przypisanie kontekstu do contextType
  static contextType = AppContext;
  declare context: AppStateType; // Użycie `declare` zamiast `context!`

  serverIpRef = createRef<HTMLInputElement>();

  // Add a new connection
  async addNewConnection(name : string, url : string) {
    try {
    await invoke('add_connection', { name, url });
        console.log('Connection added successfully!');
    } catch (error) {
        console.error('Failed to add connection:', error);
    }
  }

  async handleAddConnection() {
    const serverIp = this.serverIpRef.current?.value; // Pobranie wartości z inputa
    console.log(serverIp);
    if (serverIp) {
      getCurrentWindow().close();
      await this.addNewConnection('defaultName', serverIp); // Użyj odpowiedniego `name`
    }
  }


  render() {
      return (
        <div className="small-window">
          <div className="input-caption" >Server address</div>
          <input type="text" id="server-ip" ref={this.serverIpRef}/>
          <div className="f-right butt butt-colored mt-10" onClick={() => this.handleAddConnection()}>Add connection</div>
        </div>
      );
  }
}