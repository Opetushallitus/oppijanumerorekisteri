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
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { OrganisaatioKayttooikeusryhmatState } from '../../reducers/organisaatiokayttooikeusryhmat.reducer';
import { KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { KoodistoState } from '../../reducers/koodisto.reducer';
import Mfa from './Mfa';

export type View = 'OMATTIEDOT' | 'VIRKAILIJA' | 'ADMIN' | 'OPPIJA';
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
    view: View;
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
        const {
            henkilo,
            view,
            kayttooikeus,
            koodisto,
            locale,
            l10n,
            organisaatioKayttooikeusryhmat,
            oidHenkilo,
            createBasicInfo,
            readOnlyButtons,
        } = this.props;
        const L = l10n[locale];
        if (henkilo.henkiloKayttoEstetty) {
            return <VirheKayttoEstetty L={l10n[locale]} />;
        }

        const kayttooikeusryhmat = organisaatioKayttooikeusryhmat?.kayttooikeusryhmat ?? [];

        return (
            <div>
                <div className="wrapper">
                    <UserContentContainer
                        basicInfo={createBasicInfo}
                        readOnlyButtons={readOnlyButtons}
                        oidHenkilo={oidHenkilo}
                        view={view}
                    />
                </div>
                <div className="wrapper">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{L.TIETOTURVA_ASETUKSET_OTSIKKO}</p>
                    </div>
                    <Mfa view={view} />
                </div>
                {henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && (
                    <div className="wrapper">
                        {henkilo.henkiloLoading ||
                        henkilo.kayttajaLoading ||
                        koodisto.yhteystietotyypitKoodistoLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewContactContent {...this.props} readOnly={true} />
                        )}
                    </div>
                )}
                {view !== 'OMATTIEDOT' && view !== 'OPPIJA' && (
                    <div className="wrapper">
                        {henkilo.henkiloOrgsLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewOrganisationContent {...this.props} readOnly={true} />
                        )}
                    </div>
                )}
                {view !== 'OPPIJA' && (
                    <div className="wrapper" ref={(ref) => (this.existingKayttooikeusRef = ref)}>
                        {kayttooikeus.kayttooikeusLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewExistingKayttooikeus
                                {...this.props}
                                vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                                oidHenkilo={henkilo.henkilo.oidHenkilo}
                                isOmattiedot={view === 'OMATTIEDOT'}
                            />
                        )}
                    </div>
                )}
                {henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && view !== 'OPPIJA' && (
                    <div className="wrapper">
                        {kayttooikeus.kayttooikeusAnomusLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewOpenKayttooikeusanomus {...this.props} isOmattiedot={view === 'OMATTIEDOT'} />
                        )}
                    </div>
                )}
                {view !== 'OPPIJA' && (
                    <div className="wrapper">
                        {kayttooikeus.kayttooikeusLoading ? (
                            <Loader />
                        ) : (
                            <HenkiloViewExpiredKayttooikeus
                                {...this.props}
                                oidHenkilo={henkilo.henkilo.oidHenkilo}
                                isOmattiedot={view === 'OMATTIEDOT'}
                            />
                        )}
                    </div>
                )}
                {view !== 'OMATTIEDOT' && view !== 'OPPIJA' && (
                    <div className="wrapper">
                        <HenkiloViewCreateKayttooikeus
                            {...this.props}
                            vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                            existingKayttooikeusRef={this.existingKayttooikeusRef}
                            isPalvelukayttaja={henkilo.kayttaja.kayttajaTyyppi === 'PALVELU'}
                        />
                    </div>
                )}
                {view === 'OMATTIEDOT' && (
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
        return this.props.ryhmas?.ryhmas
            ? this.props.ryhmas?.ryhmas.map((ryhma) => ({
                  label:
                      ryhma.nimi[this.props.locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                  value: ryhma.oid,
              }))
            : [];
    }
}

export default HenkiloViewPage;
