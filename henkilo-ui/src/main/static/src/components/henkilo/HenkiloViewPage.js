// @flow
import React from 'react';
import type {Locale} from '../../types/locale.type'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent';
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent'
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewCreateKayttooikeus from "../common/henkilo/HenkiloViewCreateKayttooikeus";
import Loader from "../common/icons/Loader";
import HenkiloViewContactContent from "../common/henkilo/HenkiloViewContactContent";
import StaticUtils from '../common/StaticUtils'
import type {L10n} from "../../types/localisation.type";

type Props = {
    l10n: L10n,
    locale: Locale,
    updateHenkiloAndRefetch: (any) => void,
    updateAndRefetchKayttajatieto: (henkiloOid: string, kayttajatunnus: string) => void,
    henkilo: any,
    kayttooikeus: any,
    koodisto: any,
    createBasicInfo: (boolean, (any) => void, (any) => void, any) => any,
    readOnlyButtons: ((any) => void) => any,
    passivoiHenkiloOrg: (henkiloOid: string, organisaatioOid: string) => void,
    oidHenkilo: string,
}

class HenkiloViewPage extends React.Component<Props> {

    existingKayttooikeusRef: any;

    constructor(props: Props) {
        super(props);

        this.existingKayttooikeusRef = {};
    }

    render() {
        return (
            <div>
                <div className="wrapper">
                    {
                        <HenkiloViewUserContent basicInfo={this.props.createBasicInfo}
                                                readOnlyButtons={this.props.readOnlyButtons}
                                                oidHenkilo={this.props.oidHenkilo} />
                    }
                </div>
                {this.props.henkilo.henkilo.henkiloTyyppi !== 'PALVELU' &&
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading
                        || this.props.koodisto.yhteystietotyypitKoodistoLoading
                            ? <Loader />
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
                }
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrgsLoading
                            ? <Loader />
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
                <div className="wrapper" ref={(ref) => this.existingKayttooikeusRef = ref}>
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus {...this.props} vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.henkilo)} />
                    }
                </div>
                {this.props.henkilo.henkilo.henkiloTyyppi !== 'PALVELU' &&
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? <Loader />
                            : <HenkiloViewOpenKayttooikeusanomus {...this.props} />
                    }
                </div>
                }
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

export default HenkiloViewPage;