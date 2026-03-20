import React, { useState } from 'react';

import { KAYTTOOIKEUDENTILA, KayttooikeudenTila } from '../../globals/KayttooikeudenTila';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { useLocalisations } from '../../selectors';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { getOrganisationNameWithType } from '../common/StaticUtils';
import { useGetOrganisationsQuery } from '../../api/kayttooikeus';

type Props = {
    handleAnomus: (anomusId: number, tila: KayttooikeudenTila, kasittelija: HenkilonNimi, peruste: string) => void;
    anomus: HaettuKayttooikeusryhma;
};

const AnomusHylkaysPopup = ({ anomus, handleAnomus }: Props) => {
    const [peruste, setPeruste] = useState('');
    const { data: organisations } = useGetOrganisationsQuery();
    const { L, locale } = useLocalisations();
    const henkilo = anomus.anomus.henkilo;
    const { organisaatioOid } = anomus.anomus;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <div style={{ fontWeight: 'bold' }}>{L('HENKILO_KAYTTOOIKEUS_NIMI')}:</div>
                <div>{henkilo.etunimet + ' ' + henkilo.sukunimi}</div>
                <div style={{ fontWeight: 'bold' }}>{L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO')}:</div>
                <div>{getOrganisationNameWithType(organisations, organisaatioOid, L, locale)}</div>
                <div style={{ fontWeight: 'bold' }}>{L('HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA')}:</div>
                <div>
                    {anomus.kayttoOikeusRyhma.nimi.texts.filter((text) => text.lang === locale.toUpperCase())[0]?.text}
                </div>
            </div>
            <div>
                <label className="oph-ds-label" htmlFor="hylkaysperuste">
                    {L('HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYSPERUSTE')}
                </label>
                <textarea
                    className="oph-ds-textarea"
                    placeholder={L('HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYSPERUSTE')}
                    name="hylkaysperuste"
                    id="hylkaysperuste"
                    value={peruste}
                    cols={20}
                    rows={10}
                    onChange={(event) => setPeruste(event.target.value)}
                />
            </div>
            <div>
                <button
                    className="oph-ds-button"
                    onClick={() => handleAnomus(anomus.id, KAYTTOOIKEUDENTILA.HYLATTY, henkilo, peruste)}
                >
                    {L('HENKILO_KAYTTOOIKEUSANOMUS_VAHVISTA_HYLKAYS')}
                </button>
            </div>
        </div>
    );
};

export default AnomusHylkaysPopup;
