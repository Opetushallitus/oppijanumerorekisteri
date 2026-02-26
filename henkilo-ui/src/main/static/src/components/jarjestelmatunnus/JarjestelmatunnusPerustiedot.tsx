import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { format, parseISO } from 'date-fns';

import { JarjestelmatunnusCasModal } from './JarjestelmatunnusCasModal';
import { JarjestelmatunnusOauth2Modal } from './JarjestelmatunnusOauth2Modal';
import { OphDsInput } from '../design-system/OphDsInput';
import { useGetHenkiloQuery, useUpdateHenkiloMutation } from '../../api/oppijanumerorekisteri';
import { add } from '../../slices/toastSlice';
import OphModal from '../common/modal/OphModal';
import { useGetPalvelukayttajaQuery } from '../../api/kayttooikeus';
import { useAppDispatch } from '../../store';
import { useLocalisations } from '../../selectors';

export const JarjestelmatunnusPerustiedot = () => {
    const params = useParams();
    if (!params.oid) {
        return;
    }

    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const [muokkaa, setMuokkaa] = useState(false);
    const [oauth2Modal, setOauth2Modal] = useState(false);
    const [casModal, setCasModal] = useState(false);
    const { data: henkilo } = useGetHenkiloQuery(params.oid);
    const [updateHenkilo, { isLoading: isUpdatingHenkilo }] = useUpdateHenkiloMutation();
    const { data: jarjestelmatunnus } = useGetPalvelukayttajaQuery(params.oid);
    const [palvelunNimi, setPalvelunNimi] = useState(henkilo?.sukunimi);

    useEffect(() => {
        if (henkilo) {
            setPalvelunNimi(henkilo.sukunimi);
        }
    }, [henkilo]);

    const updatePerustiedot = async () => {
        await updateHenkilo({ oidHenkilo: params.oid, sukunimi: palvelunNimi })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `jarjestelmatunnus-edit-${Math.random()}`,
                        header: L('JARJESTELMATUNNUS_PAIVITYS_ONNISTUI'),
                        type: 'ok',
                    })
                );
                setMuokkaa(false);
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `jarjestelmatunnus-edit-${Math.random()}`,
                        header: L('NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'),
                        type: 'error',
                    })
                );
            });
    };

    return (
        <>
            <h2 className="jarjestelmatunnus-edit-header">{L('PALVELUN_PERUSTIEDOT')}</h2>
            <div className="jarjestelmatunnus-edit-info">
                <div className="jarjestelmatunnus-perustiedot">
                    {muokkaa ? (
                        <form onSubmit={updatePerustiedot}>
                            <OphDsInput
                                id="palvelunnimi"
                                defaultValue={henkilo?.sukunimi}
                                label={L('HENKILO_PALVELUN_NIMI')}
                                onChange={setPalvelunNimi}
                            />
                            <div className="jarjestelmatunnus-edit-buttons">
                                <button
                                    className="oph-ds-button"
                                    onClick={updatePerustiedot}
                                    disabled={isUpdatingHenkilo || !palvelunNimi}
                                    data-test-id="tallenna"
                                >
                                    {L('TALLENNA')}
                                </button>
                                <button
                                    className="oph-ds-button oph-ds-button-bordered"
                                    onClick={() => setMuokkaa(false)}
                                    disabled={isUpdatingHenkilo}
                                >
                                    {L('PERUUTA')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="jarjestelmatunnus-edit-info-grid">
                                <div>{L('HENKILO_PALVELUN_NIMI')}</div>
                                <div data-test-id="palvelunnimi">{henkilo?.sukunimi}</div>
                            </div>
                            <button className="oph-ds-button" onClick={() => setMuokkaa(true)}>
                                {L('MUOKKAA_PALVELUN_NIMEA')}
                            </button>
                        </>
                    )}
                </div>
                <div>
                    <h3>{L('OAUTH2_TUNNUS_HALLINTA')}</h3>

                    <p>{L('OAUTH2_TUNNUS_SELITE')}</p>
                    <p>
                        <span>{L('OAUTH2_TUNNUS_OHJE')}</span>
                        <a
                            href="https://wiki.eduuni.fi/x/Md8hHw"
                            target="_blank"
                            rel="noreferrer"
                            className="oph-ds-link oph-ds-link-new-window"
                        >
                            https://wiki.eduuni.fi/x/Md8hHw
                        </a>
                    </p>
                    {!!jarjestelmatunnus?.oauth2Credentials?.length && (
                        <div className="jarjestelmatunnus-edit-oauth2-grid">
                            <div>client_id</div>
                            <div>{L('LUOTU')}</div>
                            <div>{L('KASITTELIJA')}</div>
                            {jarjestelmatunnus.oauth2Credentials.map((o) => (
                                <React.Fragment key={o.created}>
                                    <div data-test-id="oauth2clientid">{o.clientId}</div>
                                    <div>{format(parseISO(o.created), 'd.M.yyyy H:mm')}</div>
                                    <div data-test-id="kasittelija">
                                        <Link to={`/virkailija/${o.kasittelija.oid}`} className="oph-ds-link">
                                            {o.kasittelija.kutsumanimi + ' ' + o.kasittelija.sukunimi}
                                        </Link>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <button className="oph-ds-button" onClick={() => setOauth2Modal(true)} data-test-id="oauth2">
                        {L('OAUTH2_TUNNUS_UUSI')}
                    </button>
                </div>
                <div>
                    <h3>{L('CAS_TUNNUS_HALLINTA')}</h3>
                    <div className="jarjestelmatunnus-edit-info-grid">
                        <div>{L('CAS_TUNNUS')}</div>
                        <div data-test-id="castunnus">{jarjestelmatunnus?.kayttajatunnus}</div>
                        <div>{L('DUPLIKAATIT_OIDHENKILO')}</div>
                        <div data-test-id="oid">{params.oid}</div>
                    </div>
                    <button className="oph-ds-button" onClick={() => setCasModal(true)} data-test-id="cas">
                        {L('CAS_TUNNUS_UUSI')}
                    </button>
                </div>
            </div>
            {oauth2Modal && (
                <OphModal onClose={() => setOauth2Modal(false)} onOverlayClick={() => true}>
                    <JarjestelmatunnusOauth2Modal oid={params.oid} closeModal={() => setOauth2Modal(false)} />
                </OphModal>
            )}
            {casModal && (
                <OphModal onClose={() => setCasModal(false)} onOverlayClick={() => true}>
                    <JarjestelmatunnusCasModal oid={params.oid} closeModal={() => setCasModal(false)} />
                </OphModal>
            )}
        </>
    );
};
