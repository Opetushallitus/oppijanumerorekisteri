import React, { useEffect, useRef, useState } from 'react';

import { useLocalisations } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import { OphDsBanner } from '../design-system/OphDsBanner';
import { RootState, useAppDispatch } from '../../store';
import {
    clearHenkilo,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttaja,
    fetchKayttajatieto,
} from '../../actions/henkilo.actions';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { fetchAllKayttooikeusryhmasForHenkilo } from '../../actions/kayttooikeusryhma.actions';
import { useSelector } from 'react-redux';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { OphDsInput } from '../design-system/OphDsInput';
import { useUpdateHenkiloMutation } from '../../api/oppijanumerorekisteri';
import { add } from '../../slices/toastSlice';

import './JarjestelmatunnusEditPage.css';

type Props = {
    params: { oid: string };
};

export const JarjestelmatunnusEditPage = ({ params }: Props) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const [updateHenkilo, { isLoading: isUpdatingHenkilo }] = useUpdateHenkiloMutation();
    const [palvelunNimi, setPalvelunNimi] = useState(henkilo.henkilo.sukunimi);
    const [muokkaa, setMuokkaa] = useState(false);

    useEffect(() => {
        dispatch<any>(clearHenkilo());
        dispatch<any>(fetchHenkilo(params.oid));
        dispatch<any>(fetchHenkiloOrgs(params.oid));
        dispatch<any>(fetchKayttaja(params.oid));
        dispatch<any>(fetchKayttajatieto(params.oid));
        dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(params.oid));
    }, [params.oid]);

    const updatePerustiedot = async () => {
        await updateHenkilo({ oidHenkilo: params.oid, sukunimi: palvelunNimi })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `jarjestelmatunnus-edit-${Math.random()}`,
                        header: L['JARJESTELMATUNNUS_PAIVITYS_ONNISTUI'],
                        type: 'ok',
                    })
                );
                dispatch<any>(fetchHenkilo(params.oid));
                setMuokkaa(false);
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `jarjestelmatunnus-edit-${Math.random()}`,
                        header: L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'],
                        type: 'error',
                    })
                );
            });
    };

    return (
        <OphDsPage header={L['JARJESTELMATUNNUKSEN_HALLINTA']}>
            <h2 className="jarjestelmatunnus-edit-header">{L['PALVELUN_PERUSTIEDOT']}</h2>
            <div className="jarjestelmatunnus-edit-info">
                <div>
                    {muokkaa ? (
                        <form onSubmit={updatePerustiedot}>
                            <OphDsInput
                                id="palvelunnimi"
                                defaultValue={henkilo.henkilo.sukunimi}
                                label={L['HENKILO_PALVELUN_NIMI']}
                                onChange={setPalvelunNimi}
                            />
                            <div className="jarjestelmatunnus-edit-buttons">
                                <button
                                    className="oph-ds-button"
                                    onClick={updatePerustiedot}
                                    disabled={isUpdatingHenkilo || !palvelunNimi}
                                >
                                    {L['TALLENNA']}
                                </button>
                                <button
                                    className="oph-ds-button oph-ds-button-bordered"
                                    onClick={() => setMuokkaa(false)}
                                    disabled={isUpdatingHenkilo}
                                >
                                    {L['PERUUTA']}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="jarjestelmatunnus-edit-info-grid">
                                <div>{L['HENKILO_PALVELUN_NIMI']}</div>
                                <div>{henkilo.henkilo.sukunimi}</div>
                            </div>
                            <button className="oph-ds-button" onClick={() => setMuokkaa(true)}>
                                {L['MUOKKAA_PALVELUN_NIMEA']}
                            </button>
                        </>
                    )}
                </div>
                <div>
                    <h3>{L['OAUTH2_TUNNUS_HALLINTA']}</h3>
                    <p>{L['OAUTH2_TUNNUS_SELITE']}</p>
                    <p>
                        <span>{L['OAUTH2_TUNNUS_OHJE']}</span>
                        <a
                            href="https://wiki.eduuni.fi/x/Md8hHw"
                            target="_blank"
                            rel="noreferrer"
                            className="oph-ds-link oph-ds-link-new-window"
                        >
                            https://wiki.eduuni.fi/x/Md8hHw
                        </a>
                    </p>
                    <button className="oph-ds-button">{L['OAUTH2_TUNNUS_UUSI']}</button>
                </div>
                <div>
                    <h3>{L['CAS_TUNNUS_HALLINTA']}</h3>
                    <OphDsBanner type="warning">{L['CAS_TUNNUS_HUOM']}</OphDsBanner>
                    <div className="jarjestelmatunnus-edit-info-grid">
                        <div>{L['CAS_TUNNUS']}</div>
                        <div>{henkilo.kayttajatieto?.username}</div>
                        <div>{L['DUPLIKAATIT_OIDHENKILO']}</div>
                        <div>{params.oid}</div>
                    </div>
                    <button className="oph-ds-button">{L['CAS_TUNNUS_UUSI']}</button>
                </div>
            </div>
            <hr />
            <HenkiloViewOrganisationContent />
            <hr />
            <HenkiloViewExistingKayttooikeus
                existingKayttooikeusRef={existingKayttooikeusRef}
                vuosia={null}
                oidHenkilo={params.oid}
                isOmattiedot={false}
            />
            <hr />
            <HenkiloViewExpiredKayttooikeus oidHenkilo={params.oid} isOmattiedot={false} />
            <hr />
            <HenkiloViewCreateKayttooikeus
                oidHenkilo={params.oid}
                vuosia={null}
                existingKayttooikeusRef={existingKayttooikeusRef}
                isPalvelukayttaja={true}
            />
        </OphDsPage>
    );
};
