import React, { useEffect, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { useAppDispatch } from '../../store';
import KayttooikeusryhmaSelectModal from '../common/select/KayttooikeusryhmaSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { Kayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { useLocalisations } from '../../selectors';
import { useGetKayttooikeusryhmaOrganisaatiotQuery, usePostKayttooikeusAnomusMutation } from '../../api/kayttooikeus';
import { SelectOption, selectStyles } from '../../utilities/select';
import { add } from '../../slices/toastSlice';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';
import { OphDsBanner } from '../design-system/OphDsBanner';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';
import { OphDsRyhmaSelect } from '../design-system/OphDsRyhmaSelect';
import { OphDsSpinner } from '../design-system/OphDsSpinner';
import { getLocalisedText } from '../common/StaticUtils';

const Kayttooikeus = ({ kayttooikeus, onRemove }: { kayttooikeus: Kayttooikeusryhma; onRemove: () => void }) => {
    const { L, locale } = useLocalisations();
    const border = '1px solid #82D4FF';
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    border,
                    backgroundColor: '#C1EAFF',
                }}
            >
                {getLocalisedText(kayttooikeus.nimi, locale)}
                <button
                    className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                    title={L('POISTA')}
                    onClick={onRemove}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderBottom: '1px solid #82D4FF',
                    borderLeft: '1px solid #82D4FF',
                    borderRight: '1px solid #82D4FF',
                }}
            >
                {getLocalisedText(kayttooikeus.kuvaus, locale) ?? '-'}
            </div>
        </div>
    );
};

export const KayttooikeudenAnominen = ({ henkiloOid }: { henkiloOid: string }) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const { data: henkilo, isLoading } = useGetHenkiloQuery(henkiloOid);
    const [showInstructions, setShowInstructions] = useState(false);
    const [organisationSelection, setOrganisationSelection] = useState<SingleValue<OrganisaatioSelectObject>>();
    const [ryhmaSelection, setRyhmaSelection] = useState<SingleValue<SelectOption>>();
    const [activeSelection, setActiveSelection] = useState<string>();
    const { data: orgRyhmat, isFetching } = useGetKayttooikeusryhmaOrganisaatiotQuery(activeSelection ?? skipToken);
    const [kayttooikeusSelection, setKayttooikeusSelection] = useState<Kayttooikeusryhma[]>([]);
    const [perustelut, setPerustelut] = useState<string>();
    const [emails, setEmails] = useState<SelectOption[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<string>();
    const [validAnomus, setValidAnomus] = useState(false);
    const [postKayttooikeusAnomus] = usePostKayttooikeusAnomusMutation();

    const kayttooikeusryhmat = useMemo(
        () => (orgRyhmat ?? []).filter((or) => !kayttooikeusSelection.find((k) => k.id === or.id)),
        [orgRyhmat, kayttooikeusSelection]
    );

    useEffect(() => {
        const emailOptions =
            henkilo?.yhteystiedotRyhma
                .map((yr) =>
                    yr.yhteystieto
                        .filter((y) => y.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
                        .map((y) => y.yhteystietoArvo)
                )
                .flatMap((y) => y)
                .map((email) => ({ value: email, label: email })) ?? [];
        setEmails(emailOptions);
        if (emailOptions.length > 0) {
            setSelectedEmail(emailOptions[0]?.value);
        }
    }, [henkilo]);

    useEffect(() => {
        const isDirty = !!activeSelection;
        const isValid = !!activeSelection && !!selectedEmail && kayttooikeusSelection.length > 0 && !!perustelut;
        setValidAnomus(isValid);
        setShowInstructions(isDirty && !isValid);
    }, [activeSelection, kayttooikeusSelection, selectedEmail, perustelut]);

    function _changeOrganisaatioSelection(organisaatioSelection: SingleValue<OrganisaatioSelectObject>) {
        setOrganisationSelection(organisaatioSelection);
        setRyhmaSelection(undefined);
        setActiveSelection(organisaatioSelection?.oid);
    }

    function _changeRyhmaSelection(ryhmaSelection: SingleValue<SelectOption>) {
        setOrganisationSelection(undefined);
        setRyhmaSelection(ryhmaSelection);
        setActiveSelection(ryhmaSelection?.value);
    }

    function _resetAnomusFormFields() {
        setActiveSelection(undefined);
        setOrganisationSelection(undefined);
        setRyhmaSelection(undefined);
        setKayttooikeusSelection([]);
        setPerustelut('');
    }

    async function _createKayttooikeusAnomus() {
        if (!validAnomus || !activeSelection || !selectedEmail || !perustelut) {
            return;
        }

        postKayttooikeusAnomus({
            organisaatioOrRyhmaOid: activeSelection,
            email: selectedEmail,
            perustelut: perustelut,
            kayttooikeusRyhmaIds: kayttooikeusSelection.map((s) => s.id),
            anojaOid: henkiloOid,
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `anomus-ok-${Math.random()}`,
                        type: 'ok',
                        header: L('OMATTIEDOT_ANOMUKSEN_TALLENNUS_OK'),
                    })
                );
                _resetAnomusFormFields();
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `anomus-error-${Math.random()}`,
                        type: 'error',
                        header: L('OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS'),
                    })
                );
            });
    }

    return isLoading ? (
        <OphDsSpinner />
    ) : (
        <div className="henkiloViewUserContentWrapper">
            <h2>{L('OMATTIEDOT_OTSIKKO')}</h2>
            {henkilo && emails.length < 1 && (
                <OphDsBanner type="error">{L('OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_UUSI_ANOMUS')}</OphDsBanner>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1rem' }}>
                <div>
                    <label className="oph-ds-label" htmlFor="anomusOrganisaatio">
                        {L('OMATTIEDOT_ORGANISAATIO_TAI_RYHMA')}*
                    </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px' }}>
                    <OphDsOrganisaatioSelect
                        inputId="anomusOrganisaatio"
                        type="ROOT_ORGANISATION"
                        disabled={!!kayttooikeusSelection.length || !!ryhmaSelection}
                        selectedOrganisaatioOid={organisationSelection?.oid}
                        onChange={_changeOrganisaatioSelection}
                    />
                    <OphDsRyhmaSelect
                        selectOrganisaatio={_changeRyhmaSelection}
                        type="ROOT_ORGANISATION"
                        selectedOrganisaatioOid={ryhmaSelection?.value}
                        disabled={!!kayttooikeusSelection.length || !!organisationSelection}
                    />
                </div>
                {emails.length > 1 && (
                    <>
                        <div>
                            <label className="oph-ds-label" htmlFor="email">
                                {L('OMATTIEDOT_SAHKOPOSTIOSOITE')}*
                            </label>
                        </div>
                        <div style={{ maxWidth: '700px' }}>
                            <Select
                                {...selectStyles}
                                placeholder={L('OMATTIEDOT_SAHKOPOSTI_VALINTA')}
                                inputId="email"
                                options={emails}
                                value={emails.find((o) => o.value === selectedEmail)}
                                onChange={(s) => setSelectedEmail(s?.value)}
                            />
                        </div>
                    </>
                )}
                <div>
                    <label className="oph-ds-label" htmlFor="kayttooikeusSelect">
                        {L('OMATTIEDOT_ANOTTAVAT')}*
                    </label>
                </div>
                <div>
                    <KayttooikeusryhmaSelectModal
                        kayttooikeusryhmat={kayttooikeusryhmat}
                        kayttooikeusryhmaValittu={kayttooikeusSelection.length > 0}
                        onSelect={(k) => setKayttooikeusSelection([...kayttooikeusSelection, k])}
                        disabled={!activeSelection || !selectedEmail}
                        loading={isFetching}
                        isOrganisaatioSelected={!!activeSelection}
                        sallittuKayttajatyyppi="VIRKAILIJA"
                    />
                </div>
                {kayttooikeusSelection.length > 0 && (
                    <>
                        <div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '700px' }}>
                            {kayttooikeusSelection.map((k) => (
                                <Kayttooikeus
                                    key={`k-${k.id}`}
                                    kayttooikeus={k}
                                    onRemove={() =>
                                        setKayttooikeusSelection(kayttooikeusSelection.filter((s) => s.id !== k.id))
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
                <div>
                    <label className="oph-ds-label" htmlFor="perustelut">
                        {L('OMATTIEDOT_PERUSTELUT')}
                    </label>
                </div>
                <div style={{ maxWidth: '700px' }}>
                    <textarea
                        className="oph-ds-textarea"
                        value={perustelut}
                        onChange={(event) => setPerustelut(event.target.value)}
                        name="perustelut"
                        id="perustelut"
                        rows={10}
                        maxLength={255}
                        placeholder={L('OMATTIEDOT_PERUSTELU_VIRHE')}
                        disabled={!selectedEmail}
                    />
                </div>
                {showInstructions && (
                    <>
                        <div></div>
                        <div>
                            <OphDsBanner type="warning">
                                <h3>{L('OMATTIEDOT_ANOMINEN_VIRHEET')}</h3>
                                <ul>
                                    {!activeSelection ? <li>{L('OMATTIEDOT_VAATIMUS_ORGANISAATIO')}</li> : null}
                                    {kayttooikeusSelection.length < 1 ? (
                                        <li>{L('OMATTIEDOT_VAATIMUS_KAYTTOOIKEUDET')}</li>
                                    ) : null}
                                    {!selectedEmail ? <li>{L('OMATTIEDOT_VAATIMUS_EMAIL')}</li> : null}
                                    {!perustelut ? <li>{L('OMATTIEDOT_PERUSTELU_VIRHE')}</li> : null}
                                </ul>
                            </OphDsBanner>
                        </div>
                    </>
                )}
                <div></div>
                <div>
                    <button className="oph-ds-button" onClick={_createKayttooikeusAnomus} disabled={!validAnomus}>
                        {L('OMATTIEDOT_HAE_BUTTON')}
                    </button>
                </div>
            </div>
        </div>
    );
};
