import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAppDispatch } from '../../../store';
import { SpinnerInButton } from '../../common/icons/SpinnerInButton';
import OphModal from '../../common/modal/OphModal';
import { useLocalisations } from '../../../selectors';
import {
    useGetKayttooikeusryhmaQuery,
    usePutAktivoiKayttooikeusryhmaMutation,
    usePutPassivoiKayttooikeusryhmaMutation,
} from '../../../api/kayttooikeus';
import { add } from '../../../slices/toastSlice';

type OwnProps = {
    kayttooikeusryhmaId: string;
};

/**
 * Napit ja modal käyttöoikeusryhmän tilan muuttamiseen passiiviseksi ja aktiiviseksi.
 */
const ToggleKayttooikeusryhmaStateModal = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { L } = useLocalisations();
    const { data: kayttooikeusryhma } = useGetKayttooikeusryhmaQuery(props.kayttooikeusryhmaId, {
        skip: !props.kayttooikeusryhmaId,
    });
    const [isPassivoitu, setIsPassivoitu] = useState(false);
    const [isWaitingRequest, setIsWaitingRequest] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [aktivoiKayttooikeusryhma, aktivoiProps] = usePutAktivoiKayttooikeusryhmaMutation();
    const [passivoiKayttooikeusryhma, passivoiProps] = usePutPassivoiKayttooikeusryhmaMutation();

    useEffect(() => {
        setIsPassivoitu(kayttooikeusryhma?.passivoitu ?? false);
    }, [props, kayttooikeusryhma]);

    useEffect(() => {
        setIsWaitingRequest(aktivoiProps.isLoading || passivoiProps.isLoading);
    }, [aktivoiProps, passivoiProps]);

    const passivoi = async () => {
        passivoiKayttooikeusryhma(props.kayttooikeusryhmaId)
            .unwrap()
            .then(() => {
                setShowModal(false);
                navigate('/kayttooikeusryhmat/');
            })
            .catch(() =>
                dispatch(
                    add({
                        id: `passivoi-kayttooikeusryhma-error-${Math.random()}`,
                        type: 'error',
                        header: L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'),
                    })
                )
            );
    };

    const aktivoi = async () => {
        aktivoiKayttooikeusryhma(props.kayttooikeusryhmaId)
            .unwrap()
            .then(() => {
                setShowModal(false);
                navigate('/kayttooikeusryhmat/');
            })
            .catch(() =>
                dispatch(
                    add({
                        id: `passivoi-kayttooikeusryhma-error-${Math.random()}`,
                        type: 'error',
                        header: L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'),
                    })
                )
            );
    };

    return (
        <React.Fragment>
            {!isPassivoitu ? (
                <button className="oph-button oph-button-cancel" onClick={() => setShowModal(true)}>
                    {L('KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI')}
                </button>
            ) : (
                <button className="oph-button oph-button-primary" onClick={() => setShowModal(true)}>
                    {L('KAYTTOOIKEUSRYHMAT_AKTIVOI')}
                </button>
            )}
            {showModal && (
                <OphModal
                    title={
                        isPassivoitu
                            ? L('KAYTTOOIKEUSRYHMAT_LISAA_AKTIVOI_VARMISTUS')
                            : L('KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI_VARMISTUS')
                    }
                    onClose={() => setShowModal(false)}
                >
                    <div className="passivoi-modal">
                        <button
                            className="oph-button oph-button-primary"
                            onClick={() => (isPassivoitu ? aktivoi() : passivoi())}
                        >
                            <SpinnerInButton show={isWaitingRequest} />{' '}
                            {isPassivoitu ? L('KAYTTOOIKEUSRYHMAT_AKTIVOI') : L('KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI')}
                        </button>
                        <button className="oph-button oph-button-cancel" onClick={() => setShowModal(false)}>
                            {L('PERUUTA')}
                        </button>
                    </div>
                </OphModal>
            )}
        </React.Fragment>
    );
};

export default ToggleKayttooikeusryhmaStateModal;
