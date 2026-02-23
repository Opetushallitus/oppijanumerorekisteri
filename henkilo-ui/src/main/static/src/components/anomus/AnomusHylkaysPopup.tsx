import React, { useState } from 'react';

import { KAYTTOOIKEUDENTILA, KayttooikeudenTila } from '../../globals/KayttooikeudenTila';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { useLocalisations } from '../../selectors';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { getOrganisationNameWithType } from '../common/StaticUtils';
import { useGetOrganisationsQuery } from '../../api/kayttooikeus';

type Props = {
    updateHaettuKayttooikeusryhma: (arg0: number, arg1: KayttooikeudenTila, arg3: HenkilonNimi, arg4: string) => void;
    kayttooikeusryhma: HaettuKayttooikeusryhma;
};

const AnomusHylkaysPopup = ({ kayttooikeusryhma, updateHaettuKayttooikeusryhma }: Props) => {
    const [peruste, setPeruste] = useState('');
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
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
                            {isSuccess
                                ? getOrganisationNameWithType(
                                      organisations?.find((o) => o.oid === organisaatioOid),
                                      L,
                                      locale
                                  )
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
                                )[0]?.text
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
