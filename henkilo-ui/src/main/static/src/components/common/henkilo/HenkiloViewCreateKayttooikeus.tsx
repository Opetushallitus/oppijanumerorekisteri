import React, { useId, useState } from 'react';
import { addDays, addYears, format, isAfter, isBefore, parseISO } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import { SingleValue } from 'react-select';

import CKKayttooikeudet, { ValittuKayttooikeusryhma } from './createkayttooikeus/CreateKayttooikeusSection';
import { useLocalisations } from '../../../selectors';
import { SelectOption } from '../../../utilities/select';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { OphDsOrganisaatioSelect } from '../../design-system/OphDsOrganisaatioSelect';
import { OphDsRyhmaSelect } from '../../design-system/OphDsRyhmaSelect';
import ValidationMessageButton from '../button/ValidationMessageButton';
import { usePutKayttooikeusryhmaForHenkiloMutation } from '../../../api/kayttooikeus';
import { add } from '../../../slices/toastSlice';
import { useAppDispatch } from '../../../store';

import './HenkiloViewCreateKayttooikeus.css';

type OwnProps = {
    existingKayttooikeusRef: React.RefObject<HTMLDivElement>;
    oidHenkilo: string;
    isPalvelukayttaja?: boolean;
};

const filterDate = (date: Date, isPalvelukayttaja?: boolean) =>
    isPalvelukayttaja ? true : isBefore(date, addYears(new Date(), 1)) && isAfter(date, addDays(new Date(), -1));

const HenkiloViewCreateKayttooikeus = ({ existingKayttooikeusRef, isPalvelukayttaja, oidHenkilo }: OwnProps) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const [putKayttooikeusryhma] = usePutKayttooikeusryhmaForHenkiloMutation();
    const [selectedList, setSelectedList] = useState<ValittuKayttooikeusryhma[]>([]);
    const [organisationSelection, setOrganisationSelection] = useState<SingleValue<OrganisaatioSelectObject>>();
    const [ryhmaSelection, setRyhmaSelection] = useState<SingleValue<SelectOption>>(null);
    const [alkupvm, setAlkupvm] = useState<Date>(new Date());
    const defaultLoppupvm = isPalvelukayttaja ? parseISO('2099-12-31') : addYears(new Date(), 1);
    const [loppupvmInput, setLoppupvmInput] = useState<Date>();
    const loppupvm = loppupvmInput ?? defaultLoppupvm;

    const selectRyhma = (selection: SingleValue<SelectOption>) => {
        setOrganisationSelection(undefined);
        setRyhmaSelection(selection);
    };

    const selectOrganisation = (selection: SingleValue<OrganisaatioSelectObject>) => {
        setOrganisationSelection(selection);
        setRyhmaSelection(null);
    };

    const resetValues = () => {
        setSelectedList([]);
        setOrganisationSelection(undefined);
        setRyhmaSelection(null);
        setAlkupvm(new Date());
        setLoppupvmInput(undefined);
    };

    const createKayttooikeusAction = async () => {
        const organisationOid = organisationSelection?.oid ?? ryhmaSelection?.value;
        if (!organisationOid) {
            return;
        }
        await putKayttooikeusryhma({
            henkiloOid: oidHenkilo,
            organisationOid: organisationOid,
            body: selectedList.map((selected) => ({
                id: selected.value,
                kayttoOikeudenTila: 'MYONNA',
                alkupvm: format(alkupvm, 'yyyy-MM-dd'),
                loppupvm: format(loppupvm, 'yyyy-MM-dd'),
            })),
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `kayttooikeus-${oidHenkilo}-${Math.random()}`,
                        header: L('NOTIFICATION_LISAA_KAYTTOOIKEUS_ONNISTUI'),
                        type: 'ok',
                    })
                );
                resetValues();
                existingKayttooikeusRef.current?.scrollIntoView(true);
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `kayttooikeus-${oidHenkilo}-${Math.random()}`,
                        header: L('NOTIFICATION_LISAA_KAYTTOOIKEUS_EPAONNISTUI'),
                        type: 'error',
                    })
                );
            });
    };

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L('HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO')}</h2>
            <div className="kayttooikeus-form-grid">
                <div className="oph-bold">{L('HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE')}</div>
                <div className="kayttooikeus-form-organisation-selection">
                    <OphDsOrganisaatioSelect
                        disabled={!!ryhmaSelection || !!selectedList?.length}
                        onChange={selectOrganisation}
                    />
                    <OphDsRyhmaSelect
                        selectOrganisaatio={selectRyhma}
                        selectedOrganisaatioOid={ryhmaSelection?.value}
                        disabled={!!organisationSelection || !!selectedList?.length}
                    />
                </div>
                <div className="oph-bold">{L('HENKILO_LISAA_KAYTTOOIKEUDET_KESTO')}</div>
                <div>
                    <div className="kayttooikeus-input-container">
                        <span className="oph-h5">{L('HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA')}</span>
                        <ReactDatePicker
                            className="oph-input"
                            onChange={(date) => setAlkupvm(date ?? new Date())}
                            selected={alkupvm}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) => filterDate(date, isPalvelukayttaja)}
                            dateFormat={'d.M.yyyy'}
                        />
                    </div>
                    <div className="kayttooikeus-input-container">
                        <span className="oph-h5">{L('HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY')}</span>
                        <ReactDatePicker
                            className="oph-input"
                            onChange={(date) => date && setLoppupvmInput(date)}
                            selected={loppupvm}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) => filterDate(date, isPalvelukayttaja)}
                            dateFormat={'d.M.yyyy'}
                        />
                    </div>
                </div>
                <div className="oph-bold">{L('HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT')}</div>
                <div>
                    <CKKayttooikeudet
                        selectedList={selectedList}
                        removeKayttooikeus={(id) =>
                            setSelectedList(selectedList.filter((selected) => selected.value !== id))
                        }
                        addKayttooikeus={(value) => setSelectedList([...selectedList, value])}
                        selectedOrganisationOid={organisationSelection?.oid ?? ryhmaSelection?.value}
                        isPalvelukayttaja={isPalvelukayttaja}
                    />
                </div>
                <div></div>
                <div>
                    <ValidationMessageButton
                        validationMessages={{
                            organisation: {
                                id: 'organisation',
                                labelLocalised: L('HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID'),
                                isValid: !!organisationSelection || !!ryhmaSelection,
                            },
                            kayttooikeus: {
                                id: 'kayttooikeus',
                                labelLocalised: L('HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'),
                                isValid: !!selectedList?.length,
                            },
                        }}
                        buttonAction={createKayttooikeusAction}
                    >
                        {L('HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON')}
                    </ValidationMessageButton>
                </div>
            </div>
        </section>
    );
};

export default HenkiloViewCreateKayttooikeus;
