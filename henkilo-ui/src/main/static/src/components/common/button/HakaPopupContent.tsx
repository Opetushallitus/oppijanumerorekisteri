import React, { useState } from 'react';

import { useGetHakatunnisteetQuery, usePutHakatunnisteetMutation } from '../../../api/kayttooikeus';
import { useLocalisations } from '../../../selectors';
import { useAppDispatch } from '../../../store';
import { add } from '../../../slices/toastSlice';

import './HakaPopupContent.css';

type OwnProps = {
    henkiloOid: string;
};

const HakatunnistePopupContent = ({ henkiloOid }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const { data: hakatunnisteet } = useGetHakatunnisteetQuery(henkiloOid);
    const [putHakatunnisteet] = usePutHakatunnisteetMutation();
    const [newTunniste, setNewTunniste] = useState('');

    async function addHakatunniste() {
        if (newTunniste.length > 0) {
            await saveHakatunnisteet([...hakatunnisteet, newTunniste]);
            setNewTunniste('');
        }
    }

    async function removeHakatunniste(tunniste: string) {
        const filteredTunnisteet = hakatunnisteet?.filter((t) => t !== tunniste);
        await saveHakatunnisteet(filteredTunnisteet);
    }

    async function saveHakatunnisteet(tunnisteet: Array<string>) {
        await putHakatunnisteet({ oid: henkiloOid, tunnisteet: tunnisteet })
            .unwrap()
            .catch(({ data }) => {
                if (data?.errorType === 'ValidationException' && data?.message.indexOf('ovat jo käytössä') !== -1) {
                    dispatch(
                        add({
                            id: `DUPLICATE_HAKA_KEY-${Math.random()}`,
                            type: 'error',
                            header: `${L['HAKATUNNISTEET_VIRHE_KAYTOSSA_ALKU']} (${newTunniste}) ${L['HAKATUNNISTEET_VIRHE_KAYTOSSA_LOPPU']}`,
                        })
                    );
                }
            });
    }

    return (
        <div className="hakapopupcontent">
            <ul>
                {hakatunnisteet?.length > 0 ? (
                    hakatunnisteet.map((hakatunniste) => (
                        <li className="tag" key={hakatunniste}>
                            <span>{hakatunniste}</span>{' '}
                            <a className="remove" href="#poista" onClick={() => removeHakatunniste(hakatunniste)}>
                                {L['POISTA']}
                            </a>
                        </li>
                    ))
                ) : (
                    <span className="oph-h4 oph-strong hakapopup">{L['EI_HAKATUNNUKSIA']}</span>
                )}
            </ul>
            <div className="oph-field oph-field-is-required">
                <input
                    type="text"
                    className="oph-input haka-input"
                    aria-required="true"
                    placeholder="Lisää uusi tunnus"
                    value={newTunniste}
                    onChange={(e) => setNewTunniste(e.target.value)}
                    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        e.key === 'Enter' ? addHakatunniste() : null
                    }
                />
                {hakatunnisteet?.includes(newTunniste) ? (
                    <div className="oph-field-text oph-error">{L['HAKATUNNISTEET_VIRHE_OLEMASSAOLEVA']}</div>
                ) : null}
                <button
                    className="save oph-button oph-button-primary"
                    disabled={!!hakatunnisteet?.includes(newTunniste)}
                    onClick={() => addHakatunniste()}
                >
                    {L['TALLENNA_TUNNUS']}
                </button>
            </div>
        </div>
    );
};

export default HakatunnistePopupContent;
