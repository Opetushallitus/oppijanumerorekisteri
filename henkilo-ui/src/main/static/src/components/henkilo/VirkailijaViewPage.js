import './VirkailijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent'
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewCreateKayttooikeus from "../common/henkilo/HenkiloViewCreateKayttooikeus";
import Loader from "../common/icons/Loader";

class VirkailijaViewPage extends React.Component {
    constructor(props) {
        super(props);

        this.existingKayttooikeusRef = {};
    }
    render() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading
                        || this.props.koodisto.kieliKoodistoLoading
                        || this.props.koodisto.kansalaisuusKoodistoLoading
                        || this.props.koodisto.sukupuoliKoodistoLoading
                        || this.props.henkilo.kayttajatietoLoading
                        ||this.props.koodisto.yhteystietotyypitKoodistoLoading
                            ? <Loader />
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale} showPassive={false}
                                                      basicInfo={this.props.createBasicInfo}
                                                      basicInfo2={this.props.createBasicInfo2}
                                                      loginInfo={this.props.createLoginInfo}
                                                      readOnlyButtons={this.props.readOnlyButtons} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrgsLoading
                            ? <Loader />
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus {...this.props}
                                                               ref={(ref) => this.existingKayttooikeusRef = ref} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? <Loader />
                            : <HenkiloViewOpenKayttooikeusanomus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExpiredKayttooikeus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrganisaatiosLoading
                            ? <Loader />
                            : <HenkiloViewCreateKayttooikeus {...this.props}
                                                             existingKayttooikeusRef={this.existingKayttooikeusRef} />
                    }
                </div>
            </div>
        )
    }
}

export default VirkailijaViewPage;