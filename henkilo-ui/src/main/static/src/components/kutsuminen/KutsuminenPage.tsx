import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useAppDispatch, type RootState } from '../../store';
import BasicInfoForm from './BasicinfoForm';
import { fetchAllRyhmas } from '../../actions/organisaatio.actions';
import { kutsuClearOrganisaatios, kutsuAddOrganisaatio } from '../../actions/kutsuminen.actions';
import KutsuConfirmation from './KutsuConfirmation';
import Loader from '../common/icons/Loader';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import ValidationMessageButton from '../common/button/ValidationMessageButton';
import { ValidationMessage } from '../../types/validation.type';
import StaticUtils from '../common/StaticUtils';
import { fetchHenkilo } from '../../actions/henkilo.actions';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import { validateEmail } from '../../validation/EmailValidator';
import { useLocalisations } from '../../selectors';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { KutsuminenOrganisaatiosState } from '../../reducers/kutsuminen.reducer';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import Button from '../common/button/Button';
import PropertySingleton from '../../globals/PropertySingleton';
import AddedOrganization from './AddedOrganization';

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
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const addedOrgs = useSelector<RootState, KutsuminenOrganisaatiosState>((state) => state.kutsuminenOrganisaatios);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const ryhmas = useSelector<RootState, RyhmatState>((state) => state.ryhmatState);
    const initialValidationMessages: ValidationMessages = {
        organisaatioKayttooikeus: {
            id: 'organisaatioKayttooikeus',
            labelLocalised: L['VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS'],
            isValid: false,
        },
        allFilled: {
            id: 'allFilled',
            labelLocalised: L['VIRKAILIJAN_LISAYS_TAYTA_KAIKKI_KENTAT'],
            isValid: false,
        },
        sahkoposti: {
            id: 'sahkoposti',
            labelLocalised: L['VIRKAILIJAN_LISAYS_SAHKOPOSTI_VIRHEELLINEN'],
            isValid: true,
        },
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [basicInfo, setBasicInfo] = useState<KutsuBasicInfo>(initialBasicInfo);
    const [validationMessages, setValidationMessages] = useState<ValidationMessages>(initialValidationMessages);

    useEffect(() => {
        dispatch<any>(kutsuClearOrganisaatios());
        dispatch<any>(fetchAllRyhmas());
        dispatch<any>(fetchHenkilo(omattiedot.data.oid));
    }, []);

    useEffect(() => {
        updateOrganisaatioValidation(addedOrgs);
    }, [omattiedot.data.oid, addedOrgs]);

    function isValid(basicInfo: KutsuBasicInfo): boolean {
        const { email, etunimi, sukunimi, languageCode } = basicInfo;
        return !!email && !!etunimi && !!sukunimi && !!languageCode;
    }

    function isOrganizationsValid(newAddedOrgs: readonly KutsuOrganisaatio[]): boolean {
        return (
            newAddedOrgs.length > 0 &&
            newAddedOrgs.every((org) => StaticUtils.stringIsNotEmpty(org.oid) && org.selectedPermissions.length > 0)
        );
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

    function updateOrganisaatioValidation(newAddedOrgs: readonly KutsuOrganisaatio[]) {
        setValidationMessages({
            ...validationMessages,
            organisaatioKayttooikeus: {
                ...validationMessages.organisaatioKayttooikeus,
                isValid: isOrganizationsValid(newAddedOrgs),
            },
        });
    }

    function resetFormValues() {
        setBasicInfo({ ...initialBasicInfo });
        dispatch<any>(kutsuClearOrganisaatios());
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
        dispatch<any>(
            kutsuAddOrganisaatio({
                key: moment.now(),
                oid: '',
                organisation: { oid: '', name: '' },
                voimassaLoppuPvm: moment().add(1, 'years').format(PropertySingleton.state.PVM_DBFORMAATTI),
                selectablePermissions: [],
                selectedPermissions: [],
                isPermissionsLoading: false,
            })
        );
    }

    if (henkilo.henkiloLoading || ryhmas.ryhmasLoading) {
        return (
            <div className="wrapper">
                <Loader />
            </div>
        );
    } else {
        const disabled = !henkilo.henkilo.hetu || !henkilo.henkilo.yksiloityVTJ;
        return (
            <div>
                <form className="wrapper">
                    <p className="oph-h2 oph-bold">{L['VIRKAILIJAN_LISAYS_OTSIKKO']}</p>
                    <LocalNotification type="error" title={L['KUTSU_ESTETTY']} toggle={disabled}>
                        {L['KUTSU_ESTETTY_SYY']}
                    </LocalNotification>
                    <BasicInfoForm
                        L={L}
                        disabled={disabled}
                        basicInfo={basicInfo}
                        setBasicInfo={setBasicAndValidateInfo}
                        locale={locale}
                    ></BasicInfoForm>

                    <fieldset className="add-to-organisation">
                        <span className="oph-h2 oph-strong">{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO']}</span>
                        <div>
                            {addedOrgs.map((organization, index) => (
                                <AddedOrganization key={organization.key} index={index} addedOrg={organization} />
                            ))}
                        </div>
                        <div className="row">
                            <Button href="#" action={addEmptyOrganization}>
                                {L['VIRKAILIJAN_KUTSU_LISAA_ORGANISAATIO_LINKKI']}
                            </Button>
                        </div>
                    </fieldset>

                    <div className="kutsuFormFooter row">
                        <ValidationMessageButton
                            buttonAction={openConfirmationModal}
                            validationMessages={validationMessages}
                        >
                            {L['VIRKAILIJAN_LISAYS_TALLENNA']}
                        </ValidationMessageButton>
                    </div>
                    <KutsuConfirmation
                        addedOrgs={addedOrgs}
                        modalCloseFn={modalCloseFn}
                        modalOpen={modalOpen}
                        basicInfo={basicInfo}
                        resetFormValues={resetFormValues}
                        L={L}
                        locale={locale}
                    />
                </form>
            </div>
        );
    }
};

export default KutsuminenPage;
