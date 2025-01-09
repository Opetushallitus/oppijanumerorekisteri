import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { KAYTTOOIKEUDENTILA, KayttooikeudenTila } from '../../globals/KayttooikeudenTila';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { useLocalisations } from '../../selectors';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { RootState } from '../../store';
import { OrganisaatioCache } from '../../reducers/organisaatio.reducer';
import StaticUtils from '../common/StaticUtils';

type Props = {
    updateHaettuKayttooikeusryhma: (arg0: number, arg1: KayttooikeudenTila, arg3: HenkilonNimi, arg4: string) => void;
    kayttooikeusryhma: HaettuKayttooikeusryhma;
};

const AnomusHylkaysPopup = ({ kayttooikeusryhma, updateHaettuKayttooikeusryhma }: Props) => {
    const [peruste, setPeruste] = useState('');
    const organisaatioCache = useSelector<RootState, OrganisaatioCache>((state) => state.organisaatio.cached);
    const { L, locale } = useLocalisations();
    const henkilo = kayttooikeusryhma.anomus.henkilo;
    const { organisaatioOid } = kayttooikeusryhma.anomus;
    return (
        <div className="anomus-hylkays-popup">
            <table style={{ margin: '1rem 0' }}>
                <tbody>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '0.5rem' }}>
                            {L['HENKILO_KAYTTOOIKEUS_NIMI']}:
                        </td>
                        <td>{henkilo.etunimet + ' ' + henkilo.sukunimi}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '0.5rem' }}>
                            {L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO']}:
                        </td>
                        <td>
                            {Object.keys(organisaatioCache).length
                                ? StaticUtils.getOrganisationNameWithType(organisaatioCache[organisaatioOid], L, locale)
                                : '...'}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '0.5rem' }}>
                            {L['HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA']}:
                        </td>
                        <td>
                            {
                                kayttooikeusryhma.kayttoOikeusRyhma.nimi.texts.filter(
                                    (text) => text.lang === locale.toUpperCase()
                                )[0].text
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
            <textarea
                className="oph-input"
                placeholder={L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYSPERUSTE']}
                name="hylkaysperuste"
                id="hylkaysperuste"
                value={peruste}
                cols={20}
                rows={10}
                onChange={(event) => setPeruste(event.target.value)}
            />
            <button
                className="oph-button oph-button-confirm"
                style={{ textAlign: 'left', marginTop: '15px' }}
                onClick={() =>
                    updateHaettuKayttooikeusryhma(kayttooikeusryhma.id, KAYTTOOIKEUDENTILA.HYLATTY, henkilo, peruste)
                }
            >
                {L['HENKILO_KAYTTOOIKEUSANOMUS_VAHVISTA_HYLKAYS']}
            </button>
        </div>
    );
};

export default AnomusHylkaysPopup;
