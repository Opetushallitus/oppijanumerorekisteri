import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import { VirkailijaCreate } from '../../types/domain/kayttooikeus/virkailija.types';
import { isValidKutsumanimi } from '../../validation/KutsumanimiValidator';
import { isValidPassword } from '../../validation/PasswordValidator';
import { isValidKayttajatunnus } from '../../validation/KayttajatunnusValidator';
import { useLocalisations } from '../../selectors';
import { usePostCreateVirkailijaMutation } from '../../api/kayttooikeus';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsInput } from '../design-system/OphDsInput';
import { add } from '../../slices/toastSlice';
import { useAppDispatch } from '../../store';

const initialVirkailija: VirkailijaCreate = {
    etunimet: '',
    kutsumanimi: '',
    sukunimi: '',
    kayttajatunnus: '',
    salasana: '',
    salasanaUudestaan: '',
    vahvastiTunnistettu: true,
};

export const VirkailijaCreateContainer = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [virheet, setVirheet] = useState<VirkailijaCreate>(initialVirkailija);
    const [virkailija, setVirkailija] = useState(initialVirkailija);
    const [postCreateVirkailija] = usePostCreateVirkailijaMutation();
    const { L } = useLocalisations();
    const disabled =
        Object.values(virheet).filter((v) => !!v && v !== true).length > 0 || // pakolliset kentät:
        !virkailija.etunimet ||
        !virkailija.kutsumanimi ||
        !virkailija.sukunimi ||
        !virkailija.kayttajatunnus ||
        !virkailija.salasana ||
        !virkailija.salasanaUudestaan;

    const onChange = (newVirkailija: VirkailijaCreate): void => {
        setVirheet({
            ...virheet,
            kutsumanimi:
                newVirkailija.kutsumanimi && !isValidKutsumanimi(newVirkailija.etunimet, newVirkailija.kutsumanimi)
                    ? L('REKISTEROIDY_ERROR_KUTSUMANIMI')
                    : '',
            kayttajatunnus:
                newVirkailija.kayttajatunnus && !isValidKayttajatunnus(newVirkailija.kayttajatunnus)
                    ? L('NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE')
                    : '',
            salasana:
                newVirkailija.salasana && !isValidPassword(newVirkailija.salasana)
                    ? L('REKISTEROIDY_ERROR_PASSWORD_INVALID')
                    : '',
            salasanaUudestaan:
                newVirkailija.salasana &&
                newVirkailija.salasanaUudestaan &&
                newVirkailija.salasana !== newVirkailija.salasanaUudestaan
                    ? L('REKISTEROIDY_ERROR_PASSWORD_MATCH')
                    : '',
        });
        setVirkailija(newVirkailija);
    };

    const onSubmit = async (virkailijaCreate: VirkailijaCreate): Promise<void> => {
        await postCreateVirkailija(virkailijaCreate)
            .unwrap()
            .then((oid) => navigate(`/virkailija/${oid}`))
            .catch((error: { data?: { errorType?: string } }) => {
                if (error.data?.errorType === 'AccessDeniedException') {
                    dispatch(
                        add({
                            id: `testitunnus-${Math.random()}`,
                            header: L('VIRKAILIJAN_LUONTI_EI_OIKEUKSIA'),
                            type: 'error',
                        })
                    );
                } else if (error.data?.errorType === 'UsernameAlreadyExistsException') {
                    dispatch(
                        add({
                            id: `testitunnus-${Math.random()}`,
                            header: L('REKISTEROIDY_USERNAMEEXISTS_OTSIKKO'),
                            type: 'error',
                        })
                    );
                } else {
                    dispatch(
                        add({
                            id: `testitunnus-${Math.random()}`,
                            header: L('HENKILON_LUONTI_EPAONNISTUI'),
                            type: 'error',
                        })
                    );
                }
            });
    };

    return (
        <OphDsPage header={L('VIRKAILIJAN_LUONTI_OTSIKKO')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <OphDsInput
                    id="etunimet"
                    label={L('HENKILO_ETUNIMET')}
                    defaultValue={virkailija.etunimet}
                    onChange={(s) => onChange({ ...virkailija, etunimet: s })}
                    error={virheet.etunimet || undefined}
                />
                <OphDsInput
                    id="kutsumanimi"
                    label={L('HENKILO_KUTSUMANIMI')}
                    defaultValue={virkailija.kutsumanimi}
                    onChange={(s) => onChange({ ...virkailija, kutsumanimi: s })}
                    error={virheet.kutsumanimi || undefined}
                />
                <OphDsInput
                    id="sukunimi"
                    label={L('HENKILO_SUKUNIMI')}
                    defaultValue={virkailija.sukunimi}
                    onChange={(s) => onChange({ ...virkailija, sukunimi: s })}
                    error={virheet.sukunimi || undefined}
                />
                <OphDsInput
                    id="kayttajatunnus"
                    label={L('HENKILO_KAYTTAJANIMI')}
                    defaultValue={virkailija.kayttajatunnus}
                    onChange={(s) => onChange({ ...virkailija, kayttajatunnus: s })}
                    error={virheet.kayttajatunnus || undefined}
                />
                <OphDsInput
                    id="salasana"
                    label={L('HENKILO_PASSWORD')}
                    defaultValue={virkailija.salasana}
                    onChange={(s) => onChange({ ...virkailija, salasana: s })}
                    error={virheet.salasana || undefined}
                />
                <p>{L('SALASANA_OHJE')}</p>
                <OphDsInput
                    id="salasanaUudestaan"
                    label={L('HENKILO_PASSWORDAGAIN')}
                    defaultValue={virkailija.salasanaUudestaan}
                    onChange={(s) => onChange({ ...virkailija, salasanaUudestaan: s })}
                    error={virheet.salasanaUudestaan || undefined}
                />
                <div>
                    <button className="oph-ds-button" onClick={() => onSubmit(virkailija)} disabled={disabled}>
                        {L('TALLENNA_LINKKI')}
                    </button>
                </div>
            </div>
        </OphDsPage>
    );
};
