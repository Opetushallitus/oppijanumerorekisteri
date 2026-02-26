import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { SallitutKayttajatyypit } from '../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import { useLocalisations } from '../../../selectors';
import { localizeTextGroup } from '../../../utilities/localisation.util';

import './KayttooikeusryhmaSelect.css';

type KielistettyKayttooikeusryhma = {
    id: number;
    nimi: string;
    kuvaus: string;
};

type Props = {
    kayttooikeusryhmat: Kayttooikeusryhma[];
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void;
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null | undefined;
};

/**
 * Käyttöoikeusryhmän valintakomponentti.
 *
 * Ensisijaisesti tarkoitettu anomuksien luontiin, jossa halutaan näyttää käyttöoikeusryhmän nimen lisäksi kuvaus.
 */
const KayttooikeusryhmaSelect = (props: Props) => {
    const { L, locale } = useLocalisations();
    const sallitut = useMemo(() => {
        return props.kayttooikeusryhmat.filter(
            (kayttooikeusRyhma) =>
                !kayttooikeusRyhma.sallittuKayttajatyyppi ||
                kayttooikeusRyhma.sallittuKayttajatyyppi === props.sallittuKayttajatyyppi
        );
    }, [props]);

    const [valittu, setValittu] = useState<KielistettyKayttooikeusryhma>();
    const [hakutermi, setHakutermi] = useState('');
    const [naytettavat, setNaytettavat] = useState<{ id: number; nimi: string; kuvaus: string }[]>([]);

    useEffect(() => {
        const kayttooikeusryhmat = sallitut
            .map((s) => ({
                id: s.id,
                nimi: localizeTextGroup(s.nimi?.texts, locale),
                kuvaus: localizeTextGroup(s.kuvaus?.texts, locale),
            }))
            .sort((a, b) => a.nimi.localeCompare(b.nimi));
        const newNaytettavat = kayttooikeusryhmat.filter(
            (kayttooikeusryhma) => kayttooikeusryhma.nimi.toLowerCase().indexOf(hakutermi.toLowerCase()) !== -1
        );
        const newValittu = valittu?.id ? newNaytettavat.find((n) => n.id === valittu?.id) : undefined;
        setNaytettavat(newNaytettavat);
        setValittu(newValittu);
    }, [sallitut, hakutermi]);

    const onSelect = (event: React.SyntheticEvent, valittu: KielistettyKayttooikeusryhma) => {
        event.preventDefault();
        setValittu(valittu);
    };

    const onSubmit = (event: React.SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const valittuId = valittu?.id;
        const newValittu = sallitut.find((kayttooikeusryhma) => kayttooikeusryhma.id === valittuId);
        if (newValittu) {
            props.onSelect(newValittu);
            setValittu(undefined);
        }
    };

    return (
        <div className="flex-horizontal KayttooikeusryhmaSelect">
            <div className="flex-1 flex-same-size">
                <input
                    className="oph-input"
                    placeholder={L('OMATTIEDOT_RAJAA_LISTAUSTA')}
                    type="text"
                    value={hakutermi}
                    onChange={(event) => setHakutermi(event.target.value)}
                />
                {naytettavat.length === 0 ? (
                    <div className="valittavat-tyhja"></div>
                ) : (
                    <div className="valittavat">
                        {naytettavat.map((n) => (
                            <div
                                key={n.id}
                                role="button"
                                tabIndex={0}
                                className={classNames({
                                    valittu: valittu === n,
                                    valittava: true,
                                })}
                                onClick={(event) => onSelect(event, n)}
                            >
                                {n.nimi}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 flex-same-size valinta">
                {valittu && (
                    <div>
                        <div className="oph-bold">{valittu.nimi}</div>
                        <div>{valittu.kuvaus}</div>
                    </div>
                )}
                <button
                    type="button"
                    className="oph-button oph-button-primary lisaa"
                    onClick={onSubmit}
                    disabled={!valittu}
                >
                    {L('OMATTIEDOT_LISAA_HAETTAVIIN_KAYTTOOIKEUSRYHMIIN')}
                </button>
            </div>
        </div>
    );
};

export default KayttooikeusryhmaSelect;
