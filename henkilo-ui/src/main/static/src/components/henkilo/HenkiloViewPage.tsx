import React from 'react';
import { Locale } from '../../types/locale.type';
import UserContentContainer from '../common/henkilo/usercontent/UserContentContainer';
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import Loader from '../common/icons/Loader';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import StaticUtils from '../common/StaticUtils';
import { L10n } from '../../types/localisation.type';
import HenkiloViewCreateKayttooikeusanomus from '../common/henkilo/HenkiloViewCreateKayttooikeusanomus';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { OrganisaatioCache, OrganisaatioState } from '../../reducers/organisaatio.reducer';
import { path } from 'ramda';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { OrganisaatioKayttooikeusryhmatState } from '../../reducers/organisaatiokayttooikeusryhmat.reducer';
import { KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { KoodistoState } from '../../reducers/koodisto.reducer';

type Props = {
    l10n: L10n;
    locale: Locale;
    updateHenkiloAndRefetch?: (arg0: any) => void;
    updateAndRefetchKayttajatieto?: (henkiloOid: string, kayttajatunnus: string) => void;
    henkilo: HenkiloState;
    kayttooikeus: KayttooikeusRyhmaState;
    koodisto: KoodistoState;
    createBasicInfo?: (arg0: boolean, arg1: (arg0: any) => void, arg2: (arg0: any) => void, arg3: any) => any;
    readOnlyButtons?: (arg0: (arg0: any) => void) => any;
    passivoiHenkiloOrg?: (henkiloOid: string, organisaatioOid: string) => void;
    organisaatioKayttooikeusryhmat?: OrganisaatioKayttooikeusryhmatState;
    omattiedot?: OmattiedotState;
    fetchAllKayttooikeusAnomusForHenkilo?: (arg0: string) => void;
    oidHenkilo: string;
    view: string;
    organisaatios?: OrganisaatioState;
    organisaatioCache: OrganisaatioCache;
    ryhmas?: RyhmatState;
};

class HenkiloViewPage extends React.Component<Props> {
    existingKayttooikeusRef: any;

    constructor(props: Props) {
        super(props);

        this.existingKayttooikeusRef = {};
    }

    render() {
        if (this.props.henkilo.henkiloKayttoEstetty) {
            return <VirheKayttoEstetty L={this.props.l10n[this.props.locale]} />;
        }

        const kayttooikeusryhmat: Array<any> = path(['kayttooikeusryhmat'], this.props.organisaatioKayttooikeusryhmat)
            ? path(['kayttooikeusryhmat'], this.props.organisaatioKayttooikeusryhmat)
            : [];

        const kayttooikeusState = this.props.kayttooikeus || ({} as KayttooikeusRyhmaState);

        return (
            <div>
                <div className="wrapper">
                    {
                        <UserContentContainer
                            basicInfo={this.props.createBasicInfo}
                            readOnlyButtons={this.props.readOnlyButtons}
                            oidHenkilo={this.props.oidHenkilo}
                            view={this.props.view}
                        />
                    }
                </div>
                {this.props.henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && (
                    <div className="wrapper">
                        {this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewContactContent {...this.props} readOnly={true} />
                        )}
                    </div>
                )}
                {this.props.view !== 'OMATTIEDOT' && this.props.view !== 'OPPIJA' && (
                    <div className="wrapper">
                        {this.props.henkilo.henkiloOrgsLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewOrganisationContent {...this.props} readOnly={true} />
                        )}
                    </div>
                )}
                {this.props.view !== 'OPPIJA' && (
                    <div className="wrapper" ref={(ref) => (this.existingKayttooikeusRef = ref)}>
                        {kayttooikeusState.kayttooikeusLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewExistingKayttooikeus
                                {...this.props}
                                vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.kayttaja)}
                                oidHenkilo={this.props.henkilo.henkilo.oidHenkilo}
                                isOmattiedot={this.props.view === 'OMATTIEDOT'}
                            />
                        )}
                    </div>
                )}
                {this.props.henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && this.props.view !== 'OPPIJA' && (
                    <div className="wrapper">
                        {kayttooikeusState.kayttooikeusAnomusLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewOpenKayttooikeusanomus
                                {...this.props}
                                isOmattiedot={this.props.view === 'OMATTIEDOT'}
                            />
                        )}
                    </div>
                )}
                {this.props.view !== 'OPPIJA' && (
                    <div className="wrapper">
                        {kayttooikeusState.kayttooikeusLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewExpiredKayttooikeus
                                {...this.props}
                                oidHenkilo={this.props.henkilo.henkilo.oidHenkilo}
                                isOmattiedot={this.props.view === 'OMATTIEDOT'}
                            />
                        )}
                    </div>
                )}
                {this.props.view !== 'OMATTIEDOT' && this.props.view !== 'OPPIJA' && (
                    <div className="wrapper">
                        <HenkiloViewCreateKayttooikeus
                            {...this.props}
                            vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.kayttaja)}
                            existingKayttooikeusRef={this.existingKayttooikeusRef}
                            isPalvelukayttaja={this.props.henkilo.kayttaja.kayttajaTyyppi === 'PALVELU'}
                        />
                    </div>
                )}
                {this.props.view === 'OMATTIEDOT' && (
                    <div className="wrapper">
                        <HenkiloViewCreateKayttooikeusanomus
                            {...this.props}
                            ryhmaOptions={this._parseRyhmaOptions.call(this)}
                            kayttooikeusryhmat={kayttooikeusryhmat}
                        />
                    </div>
                )}
            </div>
        );
    }

    _parseRyhmaOptions(): Array<{ label: string; value: string }> {
        return this.props.ryhmas
            ? this.props.ryhmas.ryhmas.map((ryhma) => ({
                  label:
                      ryhma.nimi[this.props.locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                  value: ryhma.oid,
              }))
            : [];
    }
}

export default HenkiloViewPage;
