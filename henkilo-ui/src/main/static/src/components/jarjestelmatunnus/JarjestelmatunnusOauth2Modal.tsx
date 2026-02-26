import React, { useState } from 'react';
import { useGetPalvelukayttajaQuery, usePutPalvelukayttajaOauth2SecretMutation } from '../../api/kayttooikeus';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import { useLocalisations } from '../../selectors';

type Props = {
    oid: string;
    closeModal: () => void;
};

export const JarjestelmatunnusOauth2Modal = ({ closeModal, oid }: Props) => {
    const { L } = useLocalisations();
    const [newSecret, setNewSecret] = useState<string>();
    const [putOauth2Password, { isLoading }] = usePutPalvelukayttajaOauth2SecretMutation();
    const { data } = useGetPalvelukayttajaQuery(oid);
    const dispatch = useAppDispatch();

    const createPassword = async () => {
        await putOauth2Password(oid)
            .unwrap()
            .then(setNewSecret)
            .catch(() =>
                dispatch(add({ id: `new-secret-${Math.random()}`, type: 'error', header: L('OAUTH2_SECRET_FAIL') }))
            );
    };

    return !newSecret ? (
        <div>
            <h2>{L('VAHVISTA_UUSI_OAUTH2_OTSIKKO')}</h2>
            <p>{L('VAHVISTA_UUSI_OAUTH2_TEKSTI')}</p>
            <div className="modal-button-row">
                <button className="oph-ds-button oph-ds-button-bordered" onClick={closeModal}>
                    {L('PERUUTA')}
                </button>
                <button
                    className="oph-ds-button"
                    onClick={createPassword}
                    disabled={isLoading}
                    data-test-id="vahvista-oauth2"
                >
                    {L('LUO_JARJESTELMATUNNUS')}
                </button>
            </div>
        </div>
    ) : (
        <div>
            <h2>{L('TALLENNA_UUSI_OAUTH2_OTSIKKO')}</h2>
            <p>{L('TALLENNA_UUSI_OAUTH2_TEKSTI')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '24px', margin: '24px' }}>
                <div>client_id</div>
                <div>{data?.kayttajatunnus}</div>
                <button
                    className="oph-ds-button oph-ds-button-icon oph-ds-button-icon-copy"
                    onClick={() => navigator?.clipboard?.writeText(data?.kayttajatunnus ?? '')}
                    data-test-id="kopioiid"
                >
                    {L('KOPIOI_NAPPI')}
                </button>
                <div>client_secret</div>
                <div>***</div>
                <button
                    className="oph-ds-button oph-ds-button-icon oph-ds-button-icon-copy"
                    onClick={() => navigator?.clipboard?.writeText(newSecret)}
                    data-test-id="kopioisecret"
                >
                    {L('KOPIOI_NAPPI')}
                </button>
            </div>
            <div className="modal-button-row">
                <button className="oph-ds-button" onClick={closeModal} data-test-id="suljemodaali">
                    {L('SALASANA_TALTEEN')}
                </button>
            </div>
        </div>
    );
};
