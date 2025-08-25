import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { urls } from 'oph-urls-js';

import { http } from '../../http';
import { VirkailijaCreate } from '../../types/domain/kayttooikeus/virkailija.types';
import VirkailijaCreateForm from './VirkailijaCreateForm';
import { isValidKutsumanimi } from '../../validation/KutsumanimiValidator';
import { isValidPassword } from '../../validation/PasswordValidator';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { isValidKayttajatunnus } from '../../validation/KayttajatunnusValidator';
import { useLocalisations } from '../../selectors';

const initialVirkailija: VirkailijaCreate = {
    etunimet: '',
    kutsumanimi: '',
    sukunimi: '',
    kayttajatunnus: '',
    salasana: '',
    salasanaUudestaan: '',
    vahvastiTunnistettu: true,
};

/**
 * Virkailijan luonti -näkymä.
 */
export const VirkailijaCreateContainer = () => {
    const navigate = useNavigate();
    const [virheet, setVirheet] = useState<string[]>([]);
    const [virkailija, setVirkailija] = useState(initialVirkailija);
    const { L } = useLocalisations();
    const disabled =
        virheet.length > 0 || // pakolliset kentät:
        !virkailija.etunimet ||
        !virkailija.kutsumanimi ||
        !virkailija.sukunimi ||
        !virkailija.kayttajatunnus ||
        !virkailija.salasana ||
        !virkailija.salasanaUudestaan;

    const onChange = (newVirkailija: VirkailijaCreate): void => {
        setVirkailija(newVirkailija);
        setVirheet(validate(newVirkailija));
    };

    const validate = (virkailija: VirkailijaCreate): Array<string> => {
        const virheet = [];
        if (virkailija.kutsumanimi) {
            if (!isValidKutsumanimi(virkailija.etunimet, virkailija.kutsumanimi)) {
                virheet.push(L['REKISTEROIDY_ERROR_KUTSUMANIMI']);
            }
        }
        if (virkailija.kayttajatunnus) {
            if (!isValidKayttajatunnus(virkailija.kayttajatunnus)) {
                virheet.push(L['NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE']);
            }
        }
        if (virkailija.salasana) {
            if (!isValidPassword(virkailija.salasana)) {
                virheet.push(L['REKISTEROIDY_ERROR_PASSWORD_INVALID']);
            }
            if (virkailija.salasana !== virkailija.salasanaUudestaan) {
                virheet.push(L['REKISTEROIDY_ERROR_PASSWORD_MATCH']);
            }
        }
        return virheet;
    };

    const onSubmit = async (virkailijaCreate: VirkailijaCreate): Promise<void> => {
        try {
            const oid = await createVirkailija(virkailijaCreate);
            navigateToVirkailija(oid);
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    const handleError = (error: { errorType?: string }): void => {
        if (error.errorType === 'AccessDeniedException') {
            setVirheet([...virheet, L['VIRKAILIJAN_LUONTI_EI_OIKEUKSIA']]);
        } else if (error.errorType === 'UsernameAlreadyExistsException') {
            setVirheet([...virheet, L['REKISTEROIDY_USERNAMEEXISTS_OTSIKKO']]);
        } else {
            setVirheet([...virheet, L['HENKILON_LUONTI_EPAONNISTUI']]);
        }
    };

    const createVirkailija = async (virkailija: VirkailijaCreate): Promise<string> => {
        const url = urls.url('kayttooikeus-service.virkailija');
        return await http.post(url, virkailija);
    };

    const navigateToVirkailija = (oid: string) => {
        navigate(`/virkailija/${oid}`);
    };

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">{L['VIRKAILIJAN_LUONTI_OTSIKKO']}</span>
            <VirkailijaCreateForm virkailija={virkailija} disabled={disabled} onChange={onChange} onSubmit={onSubmit} />
            <LocalNotification
                title={L['NOTIFICATION_HENKILOTIEDOT_VIRHE_OTSIKKO']}
                toggle={virheet.length > 0}
                type="error"
            >
                <ul>
                    {virheet.map((virhe, index) => (
                        <li key={index}>{virhe}</li>
                    ))}
                </ul>
            </LocalNotification>
        </div>
    );
};
