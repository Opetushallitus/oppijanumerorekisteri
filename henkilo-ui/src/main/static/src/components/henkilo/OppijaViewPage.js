import './OppijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'
import Loader from "../common/icons/Loader";

class OppijaViewPage extends React.Component {
    render() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading
                        || this.props.koodisto.kieliKoodistoLoading
                        || this.props.koodisto.kansalaisuusKoodistoLoading
                            ? <Loader />
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale} showPassive={false}
                                                      basicInfo={this.props.createBasicInfo}
                                                      readOnlyButtons={this.props.readOnlyButtons} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading
                        || this.props.koodisto.yhteystietotyypitKoodistoLoading
                            ? <Loader />
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
            </div>
        )
    };

}

export default OppijaViewPage;