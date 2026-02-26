import React, { useState } from 'react';
import { useGetPalvelukayttajaQuery, usePutPalvelukayttajaCasPasswordMutation } from '../../api/kayttooikeus';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import { useLocalisations } from '../../selectors';

type Props = {
    oid: string;
    closeModal: () => void;
};

export const JarjestelmatunnusCasModal = ({ closeModal, oid }: Props) => {
    const { L } = useLocalisations();
    const [newPassword, setNewPassword] = useState<string>();
    const [putCasPassword, { isLoading }] = usePutPalvelukayttajaCasPasswordMutation();
    const { data } = useGetPalvelukayttajaQuery(oid);
    const dispatch = useAppDispatch();

    const createPassword = async () => {
        await putCasPassword(oid)
            .unwrap()
            .then(setNewPassword)
            .catch(() =>
                dispatch(add({ id: `new-password-${Math.random()}`, type: 'error', header: L('CAS_PASSWORD_FAIL') }))
            );
    };

    return !newPassword ? (
        <div>
            <h2>{L('VAHVISTA_UUSI_CAS_OTSIKKO')}</h2>
            <p>{L('VAHVISTA_UUSI_CAS_TEKSTI')}</p>
            <div className="modal-button-row">
                <button className="oph-ds-button oph-ds-button-bordered" onClick={closeModal}>
                    {L('PERUUTA')}
                </button>
                <button
                    className="oph-ds-button"
                    onClick={createPassword}
                    disabled={isLoading}
                    data-test-id="vahvistacas"
                >
                    {L('CAS_TUNNUS_UUSI')}
                </button>
            </div>
        </div>
    ) : (
        <div>
            <h2>{L('TALLENNA_UUSI_CAS_OTSIKKO')}</h2>
            <p>{L('TALLENNA_UUSI_CAS_TEKSTI')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '24px', margin: '24px' }}>
                <div>{L('CAS_JARJESTELMATUNNUS')}</div>
                <div>{data?.kayttajatunnus}</div>
                <button
                    className="oph-ds-button oph-ds-button-icon oph-ds-button-icon-copy"
                    onClick={() => navigator?.clipboard?.writeText(data?.kayttajatunnus ?? '')}
                    data-test-id="kopioitunnus"
                >
                    {L('KOPIOI_NAPPI')}
                </button>
                <div>{L('HENKILO_PASSWORD')}</div>
                <div>***</div>
                <button
                    className="oph-ds-button oph-ds-button-icon oph-ds-button-icon-copy"
                    onClick={() => navigator?.clipboard?.writeText(newPassword)}
                    data-test-id="kopioisalasana"
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
