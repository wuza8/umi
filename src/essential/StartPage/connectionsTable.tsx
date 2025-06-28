import { Component } from "react";
import { AppContext, AppStateType } from "../../context";
import { WithTranslation, withTranslation } from 'react-i18next';
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import ConnectionHeader from "./connectionHeader";

class ConnectionsTable extends Component<WithTranslation> {
    
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    state = {
        connections: [] as any[], // Przechowywanie danych połączeń
    };

    async getConnections() {
        try {
            const connections = await invoke('get_connections');
            console.log('Retrieved connections:', connections);
            return connections;
        } catch (error) {
            console.error('Failed to get connections:', error);
            return [];
        }
    }
    
    async componentDidMount() {
        // Pobierz dane połączeń przy montowaniu komponentu
        const connections = await this.getConnections();
        this.setState({ connections });
    }

    openAddConnectionWindow() {
        // Tworzenie nowego okna
        const newWindow = new WebviewWindow('add-connection-window', {
            title: 'Add connection',
            width: 500,
            height: 130,
            url: '/add-connection', // Ścieżka, do której nowe okno ma nawigować
            resizable: false,
            maximizable: false,
            minimizable: false,
            center: true
        });
    
        newWindow.once('tauri://created', () => {
            console.log('Nowe okno zostało utworzone');
        });
    
        newWindow.once('tauri://error', (error) => {
            console.error('Wystąpił błąd podczas tworzenia okna:', error);
        });
    }

    

    render() {
        const { t } = this.props;
        const { connections } = this.state; 

        return (
            <div>
                <div className="flex">
                    <div className="f-left"><h3>{t('start_page.connections')}</h3></div>
                    <div className="f-left ml-10"><div className="f-left butt butt-with-img" onClick={()=>{this.openAddConnectionWindow()}}>
                        <div className="butt-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> 
                        </svg></div>
                        Add connection</div>
                    </div>
                </div>
                <div className="table-line"></div>
                {connections.map((connection) => (
                    <ConnectionHeader connection_id={connection.id}>{connection.name}</ConnectionHeader>
                ))}
                {connections.length == 0 && (<span> No connections found. </span>)}
            </div>
        );
    }
}

// Export withTranslation HOC to inject i18n props
export default withTranslation()(ConnectionsTable);