import { Component } from "react";
import { AppContext, AppPage, AppStateType } from "../../context";
import { WithTranslation, withTranslation } from 'react-i18next';
import LatestTable from "./latestTable";
import ConnectionsTable from "./connectionsTable";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";

class StartPage extends Component<WithTranslation> {
    
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    // Add a new connection
    async runLocal() {
      try {
      invoke('run_local');
          console.log('Connection added successfully!');
      } catch (error) {
          console.error('Failed to add connection:', error);
      }
    }

    runLocalWindow() {
      this.runLocal();
      const { state, setState } = this.context;
      setState({...state,
        is_opened: true,
        opened_page: AppPage.ChatBot
      });
  }
  
    render() {
        const { t } = this.props;

        return (
            <div id="content">
            <div id="startup-box">
              <img src="src/assets/logo.png" width="128"/>
              <h1>{t('start_page.welcome')}</h1>
              <p>
                {t('start_page.description')}
              </p>
              <input type="button" className="butt butt-colored" id="add-project" value={t('start_page.local_instance_button')} onClick={() => {this.runLocalWindow()}}/>
              <br/>
              <LatestTable/>
              <br/>
              <ConnectionsTable/>
            </div>
          </div>
        );
    }
  }

  // Export withTranslation HOC to inject i18n props
export default withTranslation()(StartPage);