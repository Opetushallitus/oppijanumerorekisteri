import './VirkailijaViewPage.css';
import React from 'react';
import PropTypes from 'prop-types';
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent';
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewCreateKayttooikeus from "../common/henkilo/HenkiloViewCreateKayttooikeus";
import Loader from "../common/icons/Loader";
import HenkiloViewContactContent from "../common/henkilo/HenkiloViewContactContent";
import StaticUtils from '../common/StaticUtils'

class VirkailijaViewPage extends React.Component {
    constructor(props) {
        super(props);

        this.existingKayttooikeusRef = {};
    }

    static propTypes = {
        henkilo: PropTypes.shape({
            henkiloLoading: PropTypes.bool,
            kayttajatietoLoading: PropTypes.bool,
        }),
        koodisto: PropTypes.shape({
            kieliKoodistoLoading: PropTypes.bool,
            kansalaisuusKoodistoLoading: PropTypes.bool,
            sukupuoliKoodistoLoading: PropTypes.bool,
            yhteystietotyypitKoodistoLoading: PropTypes.bool,
        }),
        kayttooikeus: PropTypes.shape({
            grantableKayttooikeusLoading: PropTypes.bool,
            kayttooikeusLoading: PropTypes.bool,
            kayttooikeusAnomusLoading: PropTypes.bool,
        }),
    };

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
                        || this.props.koodisto.yhteystietotyypitKoodistoLoading
                            ? <Loader />
                            : <HenkiloViewUserContent {...this.props}
                                                      readOnly={true}
                                                      locale={this.props.locale}
                                                      showPassive={false}
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
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrgsLoading
                        || this.props.kayttooikeus.grantableKayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
                <div className="wrapper" ref={(ref) => this.existingKayttooikeusRef = ref}>
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                        || this.props.kayttooikeus.grantableKayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                        || this.props.kayttooikeus.grantableKayttooikeusLoading
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
                    <HenkiloViewCreateKayttooikeus {...this.props}
                                                   vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.henkilo)}
                                                   existingKayttooikeusRef={this.existingKayttooikeusRef} />
                </div>
            </div>
        )
    }
}

export default VirkailijaViewPage;