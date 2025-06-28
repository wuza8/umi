import { Component } from "react";
import { AppContext, AppStateType } from "../../context";
import { WithTranslation, withTranslation } from 'react-i18next';

class LatestTable extends Component<WithTranslation> {
    
    // Przypisanie kontekstu do contextType
    static contextType = AppContext;
    declare context: AppStateType; // Użycie `declare` zamiast `context!`
  
    render() {
        const { t } = this.props;

        return (
            <div>
              <h3>{t('start_page.latest')}</h3>
              <div className="table-line"></div>
              There are no latest connections...
                {/* <div className="table-main">
                    <div className="table-row">
                        Project1 - Corneria
                    </div>
                    <div className="table-row">
                        Project1 - Corneria
                    </div>
                    <div className="table-row">
                        Project1 - Corneria
                    </div>
                    <div className="table-row">
                        Project1 - Corneria
                    </div>
                    <div className="table-row">
                        Project1 - Corneria
                    </div>
                </div> */}
          </div>
        );
    }
  }

  // Export withTranslation HOC to inject i18n props
export default withTranslation()(LatestTable);