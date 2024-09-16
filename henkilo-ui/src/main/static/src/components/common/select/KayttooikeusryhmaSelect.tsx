import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { toLocalizedText } from '../../../localizabletext';
import { SallitutKayttajatyypit } from '../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import { useLocalisations } from '../../../selectors';

import './KayttooikeusryhmaSelect.css';

type KielistettyKayttooikeusryhma = {
    id: number;
    nimi: string;
    kuvaus: string;
};

type Props = {
    kayttooikeusryhmat: Array<Kayttooikeusryhma>;
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
    const [naytettavat, setNaytettavat] = useState([]);

    useEffect(() => {
        const kayttoooikeusryhmat = getKielistetyt(sallitut);
        const naytettavat = getNaytettavat(kayttoooikeusryhmat, hakutermi);
        const newValittu = valittu?.id ? naytettavat.find((naytettava) => naytettava.id === valittu?.id) : null;
        setNaytettavat(naytettavat);
        setValittu(newValittu);
    }, [sallitut, hakutermi]);

    const getKielistetyt = (kayttooikeusryhmat: Array<Kayttooikeusryhma>): Array<KielistettyKayttooikeusryhma> => {
        return kayttooikeusryhmat.map(getKielistetty).sort((a, b) => a.nimi.localeCompare(b.nimi));
    };

    const getKielistetty = (kayttooikeusryhma: Kayttooikeusryhma): KielistettyKayttooikeusryhma => {
        return {
            id: kayttooikeusryhma.id,
            nimi: toLocalizedText(locale, kayttooikeusryhma.nimi, ''),
            kuvaus: toLocalizedText(locale, kayttooikeusryhma.kuvaus, ''),
        };
    };

    const getNaytettavat = (
        kayttooikeusryhmat: Array<KielistettyKayttooikeusryhma>,
        hakutermi: string
    ): Array<KielistettyKayttooikeusryhma> => {
        return kayttooikeusryhmat.filter(
            (kayttooikeusryhma) => kayttooikeusryhma.nimi.toLowerCase().indexOf(hakutermi.toLowerCase()) !== -1
        );
    };

    const renderKayttooikeusryhma = (kayttooikeusryhma: KielistettyKayttooikeusryhma) => {
        return (
            <div
                key={kayttooikeusryhma.id}
                className={classNames({
                    valittu: valittu === kayttooikeusryhma,
                    valittava: true,
                })}
                onClick={(event) => onSelect(event, kayttooikeusryhma)}
            >
                {kayttooikeusryhma.nimi}
            </div>
        );
    };

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
                    placeholder={L['OMATTIEDOT_RAJAA_LISTAUSTA']}
                    type="text"
                    value={hakutermi}
                    onChange={(event) => setHakutermi(event.target.value)}
                />
                {naytettavat.length === 0 ? (
                    <div className="valittavat-tyhja"></div>
                ) : (
                    <div className="valittavat">{naytettavat.map(renderKayttooikeusryhma)}</div>
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
                    {L['OMATTIEDOT_LISAA_HAETTAVIIN_KAYTTOOIKEUSRYHMIIN']}
                </button>
            </div>
        </div>
    );
};

export default KayttooikeusryhmaSelect;
