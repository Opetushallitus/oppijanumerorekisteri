import React, { useEffect, useState } from 'react';
import { addYears, format } from 'date-fns';
import { skipToken } from '@reduxjs/toolkit/query/react';

import BasicInfoForm from './BasicinfoForm';
import { KutsuConfirmation } from './KutsuConfirmation';
import Loader from '../common/icons/Loader';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import ValidationMessageButton from '../common/button/ValidationMessageButton';
import { ValidationMessage } from '../../types/validation.type';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import { validateEmail } from '../../validation/EmailValidator';
import { useLocalisations } from '../../selectors';
import Button from '../common/button/Button';
import AddedOrganization from './AddedOrganization';
import { useGetOmattiedotQuery, useGetOrganisaatioRyhmatQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';

const initialBasicInfo = {
    etunimi: '',
    sukunimi: '',
    email: '',
    languageCode: '',
    saate: '',
};

type ValidationMessages = {
    organisaatioKayttooikeus: ValidationMessage;
    allFilled: ValidationMessage;
    sahkoposti: ValidationMessage;
};

const KutsuminenPage = () => {
    const { L, locale } = useLocalisations();
    useTitle(L('TITLE_KUTSULOMAKE'));
    useNavigation(mainNavigation, false);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: henkilo, isLoading } = useGetHenkiloQuery(omattiedot?.oidHenkilo ?? skipToken);
    const { isLoading: ryhmatLoading } = useGetOrganisaatioRyhmatQuery();
    const initialValidationMessages: ValidationMessages = {
        organisaatioKayttooikeus: {
            id: 'organisaatioKayttooikeus',
            labelLocalised: L('VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS'),
            isValid: false,
        },
        allFilled: {
            id: 'allFilled',
            labelLocalised: L('VIRKAILIJAN_LISAYS_TAYTA_KAIKKI_KENTAT'),
            isValid: false,
        },
        sahkoposti: {
            id: 'sahkoposti',
            labelLocalised: L('VIRKAILIJAN_LISAYS_SAHKOPOSTI_VIRHEELLINEN'),
            isValid: true,
        },
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [basicInfo, setBasicInfo] = useState<KutsuBasicInfo>({ ...initialBasicInfo });
    const [kutsuOrganisaatios, setKutsuOrganisaatios] = useState<KutsuOrganisaatio[]>([]);
    const [validationMessages, setValidationMessages] = useState<ValidationMessages>({ ...initialValidationMessages });

    useEffect(() => {
        setValidationMessages({
            ...validationMessages,
            organisaatioKayttooikeus: {
                ...validationMessages.organisaatioKayttooikeus,
                isValid:
                    kutsuOrganisaatios.length > 0 &&
                    kutsuOrganisaatios.every((org) => org.organisation.oid && org.selectedPermissions.length > 0),
            },
        });
    }, [omattiedot?.oidHenkilo, kutsuOrganisaatios]);

    function isValid(basicInfo: KutsuBasicInfo): boolean {
        const { email, etunimi, sukunimi, languageCode } = basicInfo;
        return !!email && !!etunimi && !!sukunimi && !!languageCode;
    }

    function setBasicAndValidateInfo(basicInfo: KutsuBasicInfo) {
        setBasicInfo(basicInfo);
        setValidationMessages({
            ...validationMessages,
            allFilled: {
                ...validationMessages.allFilled,
                isValid: isValid(basicInfo),
            },
            sahkoposti: {
                ...validationMessages.sahkoposti,
                isValid: !basicInfo.email || validateEmail(basicInfo.email),
            },
        });
    }

    function resetFormValues() {
        setBasicInfo({ ...initialBasicInfo });
        setKutsuOrganisaatios([]);
    }

    function openConfirmationModal(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setModalOpen(true);
    }

    function modalCloseFn(e: React.SyntheticEvent<EventTarget>) {
        e.preventDefault();
        setModalOpen(false);
    }

    function addEmptyOrganization(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setKutsuOrganisaatios([
            ...kutsuOrganisaatios,
            {
                organisation: { oid: '', name: '', type: 'organisaatio' },
                voimassaLoppuPvm: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
                selectedPermissions: [],
            },
        ]);
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
        return (
            <div className="wrapper">
                <Loader />
            </div>
        );
    } else {
        const disabled = !henkilo?.hetu || !henkilo?.yksiloityVTJ;
        return (
            <div className="mainContent wrapper">
                <h1>{L('VIRKAILIJAN_LISAYS_OTSIKKO')}</h1>
                <form>
                    <LocalNotification type="error" title={L('KUTSU_ESTETTY')} toggle={disabled}>
                        {L('KUTSU_ESTETTY_SYY')}
                    </LocalNotification>
                    <BasicInfoForm
                        disabled={disabled}
                        basicInfo={basicInfo}
                        setBasicInfo={setBasicAndValidateInfo}
                        locale={locale}
                    />

                    <fieldset className="add-to-organisation">
                        <h2>{L('VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO')}</h2>
                        <div>
                            {kutsuOrganisaatios.map((selection, i) => (
                                <AddedOrganization
                                    key={selection.organisation.oid + i}
                                    addedOrg={selection}
                                    updateOrganisation={(newOrg) => updateOrganisation(newOrg, i)}
                                    removeOrganisation={() => removeOrganisation(i)}
                                />
                            ))}
                        </div>
                        <div className="row">
                            <Button href="#" action={addEmptyOrganization}>
                                {L('VIRKAILIJAN_KUTSU_LISAA_ORGANISAATIO_LINKKI')}
                            </Button>
                        </div>
                    </fieldset>

                    <div className="kutsuFormFooter row">
                        <ValidationMessageButton
                            buttonAction={openConfirmationModal}
                            validationMessages={validationMessages}
                        >
                            {L('VIRKAILIJAN_LISAYS_TALLENNA')}
                        </ValidationMessageButton>
                    </div>
                    {modalOpen && (
                        <KutsuConfirmation
                            addedOrgs={kutsuOrganisaatios}
                            modalCloseFn={modalCloseFn}
                            basicInfo={basicInfo}
                            resetFormValues={resetFormValues}
                        />
                    )}
                </form>
            </div>
        );
    }
};

export default KutsuminenPage;
