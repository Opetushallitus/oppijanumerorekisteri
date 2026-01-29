import React, { useEffect, useId, useMemo, useState } from 'react';

import { OphDsInput } from '../design-system/OphDsInput';
import { add } from '../../slices/toastSlice';
import { useAppDispatch } from '../../store';
import { useLocalisations } from '../../selectors';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery, usePutKayttajatiedotMutation } from '../../api/kayttooikeus';
import PoistaKayttajatunnusButton from '../common/henkilo/buttons/PoistaKayttajatunnusButton';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import { isApiError } from '../../api/common';
import { isValidKayttajatunnus } from '../../validation/KayttajatunnusValidator';
import Loader from '../common/icons/Loader';
import OphModal from '../common/modal/OphModal';
import HakatunnistePopupContent from '../common/button/HakaPopupContent';
import PasswordPopupContent from '../common/button/PasswordPopupContent';

import styles from './VirkailijaPerustiedot.module.css';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';
import { parseWorkEmails } from '../../utilities/henkilo.util';

const VirkailijaPerustiedotForm = ({ oid, closeForm }: { oid: string; closeForm: () => void }) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(oid);
    const [username, setUsername] = useState<string>('');
    const [putKayttajatiedot] = usePutKayttajatiedotMutation();

    useEffect(() => {
        if (kayttajatiedot) {
            setUsername(kayttajatiedot.username);
        }
    }, [kayttajatiedot]);

    const updatePerustiedot = async () => {
        if (isValidKayttajatunnus(username) && username !== kayttajatiedot?.username) {
            await putKayttajatiedot({ oid, username })
                .unwrap()
                .then(() => closeForm())
                .catch((error) => {
                    const errorKey =
                        isApiError(error) && error.data.message.includes('username_unique')
                            ? 'NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS'
                            : 'NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE';
                    dispatch(
                        add({
                            id: `put-kayttajatiedot-${Math.random()}`,
                            type: 'error',
                            header: L[errorKey],
                        })
                    );
                });
        }
    };

    return (
        <>
            <OphDsInput
                id="username"
                error={
                    isValidKayttajatunnus(username) ? undefined : L['NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE']
                }
                defaultValue={kayttajatiedot?.username}
                label={L['HENKILO_KAYTTAJANIMI']!}
                onChange={setUsername}
            />
            <div className={styles.buttonRow}>
                <button
                    className="oph-ds-button"
                    onClick={updatePerustiedot}
                    disabled={username === kayttajatiedot?.username || !isValidKayttajatunnus(username)}
                >
                    {L['TALLENNA']}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => closeForm()} disabled={false}>
                    {L['PERUUTA']}
                </button>
            </div>
        </>
    );
};

export const VirkailijaPerustiedot = ({ oid }: { oid: string }) => {
    const { L } = useLocalisations();
    const { data: kayttajatiedot, isLoading } = useGetKayttajatiedotQuery(oid);
    const { data: henkilo } = useGetHenkiloQuery(oid);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [muokkaa, setMuokkaa] = useState(false);
    const [haka, setHaka] = useState(false);
    const [password, setPassword] = useState(false);

    const emails = useMemo(() => {
        return parseWorkEmails(henkilo?.yhteystiedotRyhma).join(', ');
    }, [henkilo]);

    const sectionId = useId();

    return (
        <section aria-labelledby={sectionId} className="henkiloViewUserContentWrapper">
            {haka && (
                <OphModal title={L['HAKATUNNISTEET']} onClose={() => setHaka(false)}>
                    <HakatunnistePopupContent henkiloOid={oid} />
                </OphModal>
            )}
            {password && (
                <OphModal title={L['SALASANA_ASETA']} onClose={() => setPassword(false)}>
                    <PasswordPopupContent oidHenkilo={oid} />
                </OphModal>
            )}
            <h2 id={sectionId}>{L['VIRKAILIJAN_TIEDOT_OTSIKKO']}</h2>
            <div className={styles.perustiedotContent}>
                {isLoading ? (
                    <Loader />
                ) : muokkaa ? (
                    <VirkailijaPerustiedotForm oid={oid} closeForm={() => setMuokkaa(false)} />
                ) : (
                    <>
                        <div className={styles.perustiedotGrid}>
                            <div>{L['HENKILO_SUKUNIMI']}</div>
                            <div data-testid="sukunimi">{kayttajatiedot?.sukunimi}</div>
                            <div>{L['HENKILO_ETUNIMET']}</div>
                            <div data-testid="etunimet">{kayttajatiedot?.etunimet}</div>
                            <div>{L['HENKILO_OPPIJANUMERO']}</div>
                            <div data-testid="oid">{oid}</div>
                            <div>{L['HENKILO_KAYTTAJANIMI']}</div>
                            <div data-testid="username">{kayttajatiedot?.username}</div>
                            <div>{L['HENKILO_TYOSAHKOPOSTI']}</div>
                            <div data-testid="email">{emails}</div>
                        </div>
                        <div className={styles.buttonRow}>
                            <button className="oph-ds-button" onClick={() => setMuokkaa(true)}>
                                {L['MUOKKAA']}
                            </button>
                            <button className="oph-ds-button" onClick={() => setHaka(true)}>
                                {L['LISAA_HAKA_LINKKI']}
                            </button>
                            <button className="oph-ds-button" onClick={() => setPassword(true)}>
                                {L['SALASANA_ASETA']}
                            </button>
                            {isOnrRekisterinpitaja(omattiedot?.organisaatiot) && (
                                <PoistaKayttajatunnusButton className="oph-ds-button" henkiloOid={oid} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
