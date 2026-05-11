import React, { useState } from 'react';

import {
    useGetHakaTunnuksetQuery,
    useGetOmatHakaTunnuksetQuery,
    usePutHakaTunnuksetMutation,
    usePutOmatHakaTunnuksetMutation,
} from '../../../api/kayttooikeus';
import { useLocalisations } from '../../../selectors';
import { useAppDispatch } from '../../../store';
import { add } from '../../../slices/toastSlice';
import { OphDsInput } from '../../design-system/OphDsInput';

import styles from './HakaPopupContent.module.css';

type OwnProps = {
    oid: string;
    view: 'virkailija' | 'omattiedot';
};

export const HakaTunnusPopupContent = ({ oid, view }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const { data: tunnukset } = view === 'omattiedot' ? useGetOmatHakaTunnuksetQuery() : useGetHakaTunnuksetQuery(oid);
    const [putHakaTunnukset] = usePutHakaTunnuksetMutation();
    const [putOmatHakaTunnukset] = usePutOmatHakaTunnuksetMutation();
    const [newTunnus, setNewTunnus] = useState('');
    const ohjeUrl = view === 'omattiedot' ? 'https://wiki.eduuni.fi/x/H4ZcCw' : 'https://wiki.eduuni.fi/x/NrGmFg';
    const ohjeText = view === 'omattiedot' ? 'HAKA_TUNNUS_OHJE_OMATTIEDOT' : 'HAKA_TUNNUS_OHJE_VIRKAILIJA';
    const eiTunnuksiaText =
        view === 'omattiedot' ? 'HAKA_TUNNUS_EI_TUNNUKSIA_OMATTIEDOT' : 'HAKA_TUNNUS_EI_TUNNUKSIA_VIRKAILIJA';

    async function addTunnus() {
        if (newTunnus.length > 0 && tunnukset) {
            await saveTunnukset([...tunnukset, newTunnus]);
            setNewTunnus('');
        }
    }

    async function removeTunnus(tunnus: string) {
        if (tunnukset) {
            await saveTunnukset(tunnukset.filter((t) => t !== tunnus));
        }
    }

    async function saveTunnukset(tunnukset: string[]) {
        await (view === 'omattiedot' ? putOmatHakaTunnukset(tunnukset) : putHakaTunnukset({ oid, tunnukset }))
            .unwrap()
            .catch(({ data }) => {
                if (data?.errorType === 'ValidationException' && data?.message.indexOf('ovat jo käytössä') !== -1) {
                    dispatch(
                        add({
                            id: `DUPLICATE_HAKA_KEY-${Math.random()}`,
                            type: 'error',
                            header: `${L('HAKA_TUNNUS_VIRHE_KAYTOSSA')} (${newTunnus})`,
                        })
                    );
                }
            });
    }

    return (
        <div className={styles.hakaPopupContent}>
            <p>
                {L(ohjeText)}{' '}
                <a href={ohjeUrl} target="_blank" rel="noreferrer">
                    {ohjeUrl}
                </a>
            </p>
            {tunnukset && tunnukset?.length > 0 ? (
                <div className={styles.hakaTunnusList} data-testid="haka-tunnukset">
                    {tunnukset.map((tunnus) => (
                        <div key={tunnus}>
                            <span>{tunnus}</span>
                            <button
                                className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                                title={L('POISTA')}
                                onClick={() => removeTunnus(tunnus)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div>{L(eiTunnuksiaText)}</div>
            )}
            <OphDsInput
                id="tunnus"
                label={L('HAKA_TUNNUS_LISAA_TUNNUS')}
                defaultValue={newTunnus}
                onChange={setNewTunnus}
            />
            <div>
                <button
                    className="oph-ds-button"
                    disabled={!newTunnus || !!tunnukset?.includes(newTunnus)}
                    onClick={() => addTunnus()}
                >
                    {L('TALLENNA_TUNNUS')}
                </button>
            </div>
        </div>
    );
};
