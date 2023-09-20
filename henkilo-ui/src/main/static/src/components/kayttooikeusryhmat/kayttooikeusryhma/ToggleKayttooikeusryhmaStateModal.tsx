import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, type RootState } from '../../../store';
import { http } from '../../../http';
import { urls } from 'oph-urls-js';
import { SpinnerInButton } from '../../common/icons/SpinnerInButton';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import { addGlobalNotification } from '../../../actions/notification.actions';
import OphModal from '../../common/modal/OphModal';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { useLocalisations } from '../../../selectors';

type OwnProps = {
    router: any;
    kayttooikeusryhmaId: string | null | undefined;
};

/**
 * Napit ja modal käyttöoikeusryhmän tilan muuttamiseen passiiviseksi ja aktiiviseksi.
 */
const ToggleKayttooikeusryhmaStateModal = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const kayttooikeusryhma = useSelector<RootState, Kayttooikeusryhma>(
        (state) => state.kayttooikeus.kayttooikeusryhma
    );
    const [isPassivoitu, setIsPassivoitu] = useState(false);
    const [isWaitingRequest, setIsWaitingRequest] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setIsPassivoitu(kayttooikeusryhma?.passivoitu);
    }, [props, kayttooikeusryhma]);

    const passivoiKayttooikeusryhma = async () => {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id.passivoi', props.kayttooikeusryhmaId);
        await toggleKayttooikeusryhmaState(url);
    };

    const aktivoiKayttooikeusryhma = async () => {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id.aktivoi', props.kayttooikeusryhmaId);
        await toggleKayttooikeusryhmaState(url);
    };

    const toggleKayttooikeusryhmaState = async (url: string) => {
        try {
            setIsWaitingRequest(true);
            await http.put(url);
            setIsWaitingRequest(false);
            props.router.push('/kayttooikeusryhmat/');
        } catch (error) {
            dispatch(
                addGlobalNotification({
                    key: 'KAYTTOOIKEUSRYHMATOGGLEVIRHE',
                    title: L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                    type: NOTIFICATIONTYPES.ERROR,
                    autoClose: 10000,
                })
            );
            throw error;
        } finally {
            setShowModal(false);
        }
    };

    return (
        <React.Fragment>
            {!isPassivoitu ? (
                <button className="oph-button oph-button-cancel" onClick={() => setShowModal(true)}>
                    {L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI']}
                </button>
            ) : (
                <button className="oph-button oph-button-primary" onClick={() => setShowModal(true)}>
                    {L['KAYTTOOIKEUSRYHMAT_AKTIVOI']}
                </button>
            )}
            {showModal && (
                <OphModal
                    title={
                        isPassivoitu
                            ? L['KAYTTOOIKEUSRYHMAT_LISAA_AKTIVOI_VARMISTUS']
                            : L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI_VARMISTUS']
                    }
                    onClose={() => setShowModal(false)}
                >
                    <div className="passivoi-modal">
                        <button
                            className="oph-button oph-button-primary"
                            onClick={() => (isPassivoitu ? aktivoiKayttooikeusryhma() : passivoiKayttooikeusryhma())}
                        >
                            <SpinnerInButton show={isWaitingRequest} />{' '}
                            {isPassivoitu ? L['KAYTTOOIKEUSRYHMAT_AKTIVOI'] : L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI']}
                        </button>
                        <button className="oph-button oph-button-cancel" onClick={() => setShowModal(false)}>
                            {L['PERUUTA']}
                        </button>
                    </div>
                </OphModal>
            )}
        </React.Fragment>
    );
};

export default ToggleKayttooikeusryhmaStateModal;
