import React, { ReactNode, useRef } from 'react';
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
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';

export type View = 'OMATTIEDOT' | 'VIRKAILIJA' | 'ADMIN' | 'OPPIJA';
type Props = {
    l10n: L10n;
    locale: Locale;
    updateHenkiloAndRefetch?: (arg0: Henkilo) => void;
    updateAndRefetchKayttajatieto?: (henkiloOid: string, kayttajatunnus: string) => void;
    henkilo: HenkiloState;
    kayttooikeus: KayttooikeusRyhmaState;
    koodisto: KoodistoState;
    createBasicInfo?: () => ReactNode;
    readOnlyButtons?: ReactNode;
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

const HenkiloViewPage = (props: Props) => {
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
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
    } = props;
    const L = l10n[locale];
    if (henkilo.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={l10n[locale]} />;
    }

    const _parseRyhmaOptions = (): Array<{ label: string; value: string }> => {
        return props.ryhmas?.ryhmas
            ? props.ryhmas?.ryhmas.map((ryhma) => ({
                  label: ryhma.nimi[props.locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                  value: ryhma.oid,
              }))
            : [];
    };

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
            {henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && !!henkilo.kayttajatieto?.username && (
                <div className="wrapper">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{L.TIETOTURVA_ASETUKSET_OTSIKKO}</p>
                    </div>
                    <Mfa view={view} />
                </div>
            )}
            {henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && (
                <div className="wrapper">
                    {henkilo.henkiloLoading || henkilo.kayttajaLoading || koodisto.yhteystietotyypitKoodistoLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewContactContent {...props} readOnly={true} />
                    )}
                </div>
            )}
            {view !== 'OMATTIEDOT' && view !== 'OPPIJA' && (
                <div className="wrapper">
                    {henkilo.henkiloOrgsLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewOrganisationContent {...props} readOnly={true} />
                    )}
                </div>
            )}
            {view !== 'OPPIJA' && (
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    {kayttooikeus.kayttooikeusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewExistingKayttooikeus
                            {...props}
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
                        <HenkiloViewOpenKayttooikeusanomus {...props} isOmattiedot={view === 'OMATTIEDOT'} />
                    )}
                </div>
            )}
            {view !== 'OPPIJA' && (
                <div className="wrapper">
                    {kayttooikeus.kayttooikeusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewExpiredKayttooikeus
                            {...props}
                            oidHenkilo={henkilo.henkilo.oidHenkilo}
                            isOmattiedot={view === 'OMATTIEDOT'}
                        />
                    )}
                </div>
            )}
            {view !== 'OMATTIEDOT' && view !== 'OPPIJA' && (
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus
                        {...props}
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                        isPalvelukayttaja={henkilo.kayttaja.kayttajaTyyppi === 'PALVELU'}
                    />
                </div>
            )}
            {view === 'OMATTIEDOT' && (
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeusanomus
                        {...props}
                        ryhmaOptions={_parseRyhmaOptions.call(this)}
                        kayttooikeusryhmat={kayttooikeusryhmat}
                    />
                </div>
            )}
        </div>
    );
};

export default HenkiloViewPage;
