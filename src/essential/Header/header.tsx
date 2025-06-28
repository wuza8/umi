import { Component, createRef } from "react";
import { AppContext, AppPage, AppStateType } from "../../context";
import { invoke } from "@tauri-apps/api/core";
import { withTranslation, WithTranslation } from "react-i18next";
import "./header.css"

enum SelectedMenu {
    File, Edit, View
}

interface HeaderState {
    show_menu: boolean,
    selected_menu: SelectedMenu
}

class Header extends Component<WithTranslation, HeaderState>{
    declare menuRef: React.RefObject<HTMLDivElement>;

    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`

    constructor(props : any) {
        super(props);
        this.state = {
          show_menu: false,
          selected_menu: SelectedMenu.File
        };

        this.menuRef = createRef();
        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
      }

    changePage(page : AppPage){
        const { state, setState } = this.context; // Dostęp do `state` z kontekstu
        setState({
            ...state,
            opened_page: page
        })
    }

    changeMenu(page : SelectedMenu) {
        this.setState({
            ...this.state,
            selected_menu: page
        })
    }

    toggleMenu() {
        console.log(this);

        this.setState({
            ...this.state,
            show_menu: !this.state.show_menu
        })
    }

    handleClickOutside(event: MouseEvent) {
        if (this.menuRef.current && !this.menuRef.current.contains(event.target as Node)) {
          this.setState({ show_menu: false });
        }
    }

    componentDidMount() {
    // Add event listener to detect clicks anywhere on the document
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
    // Cleanup the event listener when the component unmounts
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
    
  
    render() {
        const { state } = this.context; // Dostęp do `state` z kontekstu
        const { t } = this.props;

        
        return (
            <div id="titlebar" ref={this.menuRef}>
                <div id="title"><img height="20"
                src="src/assets/umilogo.png"
                /></div>
                <div className="menu-button" onClick={() => this.toggleMenu()} onMouseEnter={() => this.changeMenu(SelectedMenu.File)}>
                    {t("window_frame.file")}
                </div>
                {this.state.show_menu && this.state.selected_menu == SelectedMenu.File && 
                    <div className="header-menu">
                        <div className="header-menuitem">
                            Settings
                        </div>
                    </div>
                }
                <div className="menu-button" onClick={() => this.toggleMenu()} onMouseEnter={() => this.changeMenu(SelectedMenu.Edit)}>
                    {t("window_frame.edit")}
                </div>
                {this.state.show_menu && this.state.selected_menu == SelectedMenu.Edit && 
                    <div className="header-menu menu-edit">
                        <div className="header-menuitem">
                            Edit
                        </div>
                    </div>
                }
                <div className="menu-button" onClick={() => this.toggleMenu()} onMouseEnter={() => this.changeMenu(SelectedMenu.View)}>
                    {t("window_frame.view")}
                </div>
                {this.state.show_menu && this.state.selected_menu == SelectedMenu.View && 
                    <div className="header-menu menu-view">
                        <div className="header-menuitem">
                            View
                        </div>
                    </div>
                }
                <div className="menu-tabulator"></div>
                    
                {state.is_opened && <span id="project-buttons">
                    <div onClick={()=>this.changePage(AppPage.ChatBot)} className={state.opened_page == AppPage.ChatBot ? 'menu-bookmark menu-bookmark-clicked' : 'menu-bookmark'}>
                    Chatbot
                    </div>
                    {/* <div onClick={()=>this.changePage(AppPage.Tasks)} className={state.opened_page == AppPage.Tasks ? 'menu-bookmark menu-bookmark-clicked' : 'menu-bookmark'}>
                    Zadania
                    </div>
                    <div onClick={()=>this.changePage(AppPage.Editor)} className={state.opened_page == AppPage.Editor ? 'menu-bookmark menu-bookmark-clicked' : 'menu-bookmark'}>
                    Edytor kodu
                    </div>
                    {/* <div onClick={()=>this.changePage(AppPage.Schema)} className={state.opened_page == AppPage.Schema ? 'menu-bookmark menu-bookmark-clicked' : 'menu-bookmark'}>
                    Schemat
                    </div> */} 
                    <div onClick={()=>this.changePage(AppPage.Docs)} className={state.opened_page == AppPage.Docs ? 'menu-bookmark menu-bookmark-clicked' : 'menu-bookmark'}>
                    Docs
                    </div>
                    {/* <div onClick={()=>this.changePage(AppPage.System)} className={state.opened_page == AppPage.System ? 'menu-bookmark menu-bookmark-clicked' : 'menu-bookmark'}>
                    System
                    </div> */} 
                    
                    
                </span> 
                
                }
                

                {!state.is_opened && <div id="no-project-open-caption">
                {t("window_frame.no_project_opened")}
                </div>}
                <div id="titlebar-buttons"> {/* Icons are from https://heroicons.com/ */}
                    <div id="minimize" onClick={()=>invoke<string>('minimize')} className="titlebar-button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-8 1 40 40" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                    </svg>
                    </div>
                    <div id="maximize" onClick={()=>invoke<string>('maximize')} className="titlebar-button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-8 1 40 40" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" />
                    </svg>        
                    </div>
                    <div id="close" onClick={()=>invoke<string>('close')} className="titlebar-button titlebar-button-red"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-5 3 35 35" stroke-width="1.5" stroke="currentColor" className="size-6"> 
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    </div>
                </div>
                {state.is_opened && <span>
                <div id="model-chooser">
                    auto
                </div>
                <div id="backend-chooser">
                    <div className="float-left">ChatGPT</div>
                    
                    <div className="float-left"><svg className="arrow-backendchooser" xmlns="http://www.w3.org/2000/svg" fill="none" height="15" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg></div>
                    
                </div>
                </span>}
                
            </div>
        );

    }
  }

export default withTranslation()(Header);