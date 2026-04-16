import React, { useEffect, useState } from 'react';
import { addYears, format } from 'date-fns';
import Select from 'react-select';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { KutsuminenConfirmation } from './KutsuminenConfirmation';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import { validateEmail } from '../../validation/EmailValidator';
import { useAsiointikielet, useLocalisations } from '../../selectors';
import { KutsuminenOrganisation } from './KutsuminenOrganisation';
import { useGetOmattiedotQuery, useGetOrganisaatioRyhmatQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { virkailijaNavigation } from '../navigation/navigationconfigurations';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsBanner } from '../design-system/OphDsBanner';
import { OphDsSpinner } from '../design-system/OphDsSpinner';
import { OphDsInput } from '../design-system/OphDsInput';
import { selectStyles } from '../../utilities/select';

const initialBasicInfo = {
    etunimi: '',
    sukunimi: '',
    email: '',
    languageCode: '',
    saate: '',
};

export const emptyOrganisation = (): KutsuOrganisaatio => ({
    id: Math.random(),
    organisation: { oid: '', name: '', type: 'organisaatio' },
    voimassaLoppuPvm: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    selectedPermissions: [],
});

const KutsuminenPage = () => {
    const { L, locale } = useLocalisations();
    useTitle(L('TITLE_KUTSULOMAKE'));
    useNavigation(virkailijaNavigation, false);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: henkilo, isLoading } = useGetHenkiloQuery(omattiedot?.oidHenkilo ?? skipToken);
    const { isLoading: ryhmatLoading } = useGetOrganisaatioRyhmatQuery();
    const asiointikielet = useAsiointikielet(locale);
    const [modalOpen, setModalOpen] = useState(false);
    const [basicInfo, setBasicInfo] = useState<KutsuBasicInfo>({ ...initialBasicInfo });
    const [kutsuOrganisaatios, setKutsuOrganisaatios] = useState<KutsuOrganisaatio[]>([]);
    const [allFilled, setAllFilled] = useState(false);
    const [validEmail, setValidEmail] = useState(false);
    const [validKayttooikeus, setValidKayttooikeus] = useState(false);

    useEffect(() => {
        setValidKayttooikeus(
            kutsuOrganisaatios.length > 0 &&
                kutsuOrganisaatios.every(
                    (org) => org.organisation.oid && org.selectedPermissions.length > 0 && org.voimassaLoppuPvm
                )
        );
    }, [kutsuOrganisaatios]);

    useEffect(() => {
        const { email, etunimi, sukunimi, languageCode } = basicInfo;
        setAllFilled(!!email && !!etunimi && !!sukunimi && !!languageCode);
        setValidEmail(!email || validateEmail(email));
    }, [basicInfo]);

    function resetFormValues() {
        setBasicInfo({ ...initialBasicInfo });
        setKutsuOrganisaatios([]);
    }

    function addEmptyOrganization() {
        setKutsuOrganisaatios([...kutsuOrganisaatios, emptyOrganisation()]);
    }

    function updateOrganisation(o: KutsuOrganisaatio, index: number) {
        const newOrgs = [...kutsuOrganisaatios];
        newOrgs[index] = o;
        setKutsuOrganisaatios(newOrgs);
    }

    function removeOrganisation(index: number) {
        const newOrgs = [...kutsuOrganisaatios];
        newOrgs.splice(index, 1);
        setKutsuOrganisaatios(newOrgs);
    }

    if (isLoading || ryhmatLoading) {
        return <OphDsSpinner />;
    } else if (!henkilo?.hetu || !henkilo?.yksiloityVTJ) {
        return (
            <OphDsBanner type="error">
                <h2>{L('KUTSU_ESTETTY')}</h2>
                <p>{L('KUTSU_ESTETTY_SYY')}</p>
            </OphDsBanner>
        );
    } else {
        return (
            <OphDsPage header={L('VIRKAILIJAN_LISAYS_OTSIKKO')}>
                <h2>{L('VIRKAILIJAN_TIEDOT_OTSIKKO')}</h2>
                <div>
                    <OphDsInput
                        id="etunimi"
                        label={L('VIRKAILIJAN_TIEDOT_ETUNIMI')}
                        onChange={(s) => setBasicInfo({ ...basicInfo, etunimi: s })}
                    />
                    <OphDsInput
                        id="sukunimi"
                        label={L('VIRKAILIJAN_TIEDOT_SUKUNIMI')}
                        onChange={(s) => setBasicInfo({ ...basicInfo, sukunimi: s })}
                    />
                    <OphDsInput
                        id="email"
                        label={L('VIRKAILIJAN_TIEDOT_SPOSTI')}
                        onChange={(s) => setBasicInfo({ ...basicInfo, email: s })}
                    />
                    <div style={{ width: '300px' }}>
                        <label className="oph-ds-label" htmlFor="languageSelection">
                            {L('VIRKAILIJAN_TIEDOT_ASIOINTIKIELI')}
                        </label>
                        <Select
                            {...selectStyles}
                            inputId="kieli-select"
                            placeholder={L('HENKILO_ASIOINTIKIELI') + '...'}
                            value={asiointikielet.find((l) => l.value === basicInfo.languageCode)}
                            options={asiointikielet}
                            onChange={(s) => s && setBasicInfo({ ...basicInfo, languageCode: s?.value })}
                        />
                    </div>
                    <div style={{ width: '300px' }}>
                        <label className="oph-ds-label" htmlFor="saate">
                            {L('VIRKAILIJAN_TIEDOT_SAATE')}
                        </label>
                        <textarea
                            id="saate"
                            className="oph-ds-textarea"
                            rows={3}
                            value={basicInfo.saate}
                            placeholder={L('VALINNAINEN_SAATE')}
                            onChange={(s) => setBasicInfo({ ...basicInfo, saate: s.target.value })}
                        />
                    </div>
                </div>
                <div>{L('VIRKAILIJAN_LISAYS_ASIOINTIKIELI_TARKENNE')}</div>
                <h2>{L('VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO')}</h2>
                <div>
                    {kutsuOrganisaatios.map((selection, i) => (
                        <KutsuminenOrganisation
                            key={`added-org-${selection.id}`}
                            index={i}
                            addedOrg={selection}
                            updateOrganisation={(newOrg) => updateOrganisation(newOrg, i)}
                            removeOrganisation={() => removeOrganisation(i)}
                        />
                    ))}
                </div>
                <div>
                    <button
                        className="oph-ds-button oph-ds-button-bordered oph-ds-button-icon oph-ds-button-bordered-icon-plus"
                        onClick={addEmptyOrganization}
                    >
                        {L('VIRKAILIJAN_KUTSU_LISAA_ORGANISAATIO_LINKKI')}
                    </button>
                </div>
                <div>
                    {(!allFilled || !validEmail || !validKayttooikeus) && (
                        <div style={{ marginBottom: '1rem' }}>
                            <OphDsBanner type="warning">
                                <ul>
                                    {!allFilled && <li>{L('VIRKAILIJAN_LISAYS_TAYTA_KAIKKI_KENTAT')}</li>}
                                    {!validEmail && <li>{L('VIRKAILIJAN_LISAYS_SAHKOPOSTI_VIRHEELLINEN')}</li>}
                                    {!validKayttooikeus && (
                                        <li>{L('VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS')}</li>
                                    )}
                                </ul>
                            </OphDsBanner>
                        </div>
                    )}
                    <div>
                        <button
                            className="oph-ds-button"
                            disabled={!allFilled || !validEmail || !validKayttooikeus}
                            onClick={() => setModalOpen(true)}
                        >
                            {L('VIRKAILIJAN_LISAYS_TALLENNA')}
                        </button>
                    </div>
                </div>
                {modalOpen && (
                    <KutsuminenConfirmation
                        addedOrgs={kutsuOrganisaatios}
                        modalCloseFn={() => setModalOpen(false)}
                        basicInfo={basicInfo}
                        resetFormValues={resetFormValues}
                    />
                )}
            </OphDsPage>
        );
    }
};

export default KutsuminenPage;
