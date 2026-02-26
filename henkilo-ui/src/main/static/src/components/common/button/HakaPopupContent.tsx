import React, { useState } from 'react';

import { useGetHakatunnisteetQuery, usePutHakatunnisteetMutation } from '../../../api/kayttooikeus';
import { useLocalisations } from '../../../selectors';
import { useAppDispatch } from '../../../store';
import { add } from '../../../slices/toastSlice';
import { OphDsInput } from '../../design-system/OphDsInput';

import styles from './HakaPopupContent.module.css';

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
        if (newTunniste.length > 0 && hakatunnisteet) {
            await saveHakatunnisteet([...hakatunnisteet, newTunniste]);
            setNewTunniste('');
        }
    }

    async function removeHakatunniste(tunniste: string) {
        if (hakatunnisteet) {
            const filteredTunnisteet = hakatunnisteet?.filter((t) => t !== tunniste);
            await saveHakatunnisteet(filteredTunnisteet);
        }
    }

    async function saveHakatunnisteet(tunnisteet: string[]) {
        await putHakatunnisteet({ oid: henkiloOid, tunnisteet: tunnisteet })
            .unwrap()
            .catch(({ data }) => {
                if (data?.errorType === 'ValidationException' && data?.message.indexOf('ovat jo käytössä') !== -1) {
                    dispatch(
                        add({
                            id: `DUPLICATE_HAKA_KEY-${Math.random()}`,
                            type: 'error',
                            header: `${L('HAKATUNNISTEET_VIRHE_KAYTOSSA_ALKU')} (${newTunniste}) ${L('HAKATUNNISTEET_VIRHE_KAYTOSSA_LOPPU')}`,
                        })
                    );
                }
            });
    }

    return (
        <div className={styles.hakaPopupContent}>
            {hakatunnisteet && hakatunnisteet?.length > 0 ? (
                <ul className={styles.hakaTunnisteList}>
                    {hakatunnisteet.map((hakatunniste) => (
                        <li key={hakatunniste}>
                            <span>{hakatunniste}</span>
                            <button
                                className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                                title={L('POISTA')}
                                onClick={() => removeHakatunniste(hakatunniste)}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <div>{L('EI_HAKATUNNUKSIA')}</div>
            )}
            <OphDsInput
                id="hakatunniste"
                label="Lisää uusi tunnus"
                defaultValue={newTunniste}
                onChange={(t) => setNewTunniste(t)}
            />
            <div>
                <button
                    className="oph-ds-button"
                    disabled={!newTunniste || !!hakatunnisteet?.includes(newTunniste)}
                    onClick={() => addHakatunniste()}
                >
                    {L('TALLENNA_TUNNUS')}
                </button>
            </div>
        </div>
    );
};

export default HakatunnistePopupContent;
