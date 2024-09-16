import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import UserContentContainer from '../common/henkilo/usercontent/UserContentContainer';
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import Loader from '../common/icons/Loader';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import StaticUtils from '../common/StaticUtils';
import { HenkiloViewCreateKayttooikeusanomus } from '../common/henkilo/HenkiloViewCreateKayttooikeusanomus';
import Mfa from './Mfa';
import { RootState } from '../../store';
import { useLocalisations } from '../../selectors';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { KoodistoState } from '../../reducers/koodisto.reducer';
import { OrganisaatioKayttooikeusryhmatState } from '../../reducers/organisaatiokayttooikeusryhmat.reducer';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import { KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { Identifications } from './Identifications';

export type View = 'omattiedot' | 'virkailija' | 'admin' | 'oppija';
type Props = {
    oidHenkilo: string;
    view: View;
};

export const HenkiloViewPage = (props: Props) => {
    const { L, locale } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const koodisto = useSelector<RootState, KoodistoState>((state) => state.koodisto);
    const OrganisaatioKayttooikeusryhmat = useSelector<RootState, OrganisaatioKayttooikeusryhmatState>(
        (state) => state.OrganisaatioKayttooikeusryhmat
    );
    const ryhmatState = useSelector<RootState, RyhmatState>((state) => state.ryhmatState);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const { view, oidHenkilo } = props;
    const { data: omattiedot } = useGetOmattiedotQuery();
    const isRekisterinpitaja = omattiedot ? isOnrRekisterinpitaja(omattiedot.organisaatiot) : false;

    const _parseRyhmaOptions = (): Array<{ label: string; value: string }> => {
        return (
            ryhmatState?.ryhmas?.map((ryhma) => ({
                label: ryhma.nimi[locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                value: ryhma.oid,
            })) ?? []
        );
    };

    const kayttooikeusryhmat = OrganisaatioKayttooikeusryhmat?.kayttooikeusryhmat ?? [];

    return (
        <div>
            <div className="wrapper">
                <UserContentContainer oidHenkilo={oidHenkilo} view={view} />
            </div>
            {view !== 'omattiedot' && isRekisterinpitaja && henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && (
                <div className="wrapper">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{L.TUNNISTEET_OTSIKKO}</p>
                    </div>
                    <Identifications oid={henkilo.henkilo.oidHenkilo} />
                </div>
            )}
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
                        <HenkiloViewContactContent view={view} readOnly={true} />
                    )}
                </div>
            )}
            {view !== 'omattiedot' && view !== 'oppija' && (
                <div className="wrapper">
                    {henkilo.henkiloOrgsLoading ? <Loader /> : <HenkiloViewOrganisationContent readOnly={true} />}
                </div>
            )}
            {view !== 'oppija' && (
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    {kayttooikeus.kayttooikeusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewExistingKayttooikeus
                            vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                            oidHenkilo={oidHenkilo}
                            isOmattiedot={view === 'omattiedot'}
                        />
                    )}
                </div>
            )}
            {henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && view !== 'oppija' && (
                <div className="wrapper">
                    {kayttooikeus.kayttooikeusAnomusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewOpenKayttooikeusanomus
                            kayttooikeus={kayttooikeus}
                            isOmattiedot={view === 'omattiedot'}
                        />
                    )}
                </div>
            )}
            {view !== 'oppija' && (
                <div className="wrapper">
                    {kayttooikeus.kayttooikeusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewExpiredKayttooikeus
                            oidHenkilo={henkilo.henkilo.oidHenkilo}
                            isOmattiedot={view === 'omattiedot'}
                        />
                    )}
                </div>
            )}
            {view !== 'omattiedot' && view !== 'oppija' && (
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus
                        oidHenkilo={oidHenkilo}
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                        isPalvelukayttaja={henkilo.kayttaja.kayttajaTyyppi === 'PALVELU'}
                    />
                </div>
            )}
            {view === 'omattiedot' && (
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeusanomus
                        ryhmaOptions={_parseRyhmaOptions.call(this)}
                        kayttooikeusryhmat={kayttooikeusryhmat}
                    />
                </div>
            )}
        </div>
    );
};
