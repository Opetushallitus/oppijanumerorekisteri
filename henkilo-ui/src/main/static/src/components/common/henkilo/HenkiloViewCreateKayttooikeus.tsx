import React, { useId, useState } from 'react';
import moment from 'moment';
import ReactDatePicker from 'react-datepicker';

import CKKayttooikeudet, { ValittuKayttooikeusryhma } from './createkayttooikeus/CKKayttooikeudet';
import PropertySingleton from '../../../globals/PropertySingleton';
import { useLocalisations } from '../../../selectors';
import { SelectOption } from '../../../utilities/select';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { OphDsOrganisaatioSelect } from '../../design-system/OphDsOrganisaatioSelect';
import RyhmaSelection from '../select/RyhmaSelection';
import ValidationMessageButton from '../button/ValidationMessageButton';
import { usePutKayttooikeusryhmaForHenkiloMutation } from '../../../api/kayttooikeus';
import { add } from '../../../slices/toastSlice';
import { useAppDispatch } from '../../../store';

import './HenkiloViewCreateKayttooikeus.css';

type OwnProps = {
    existingKayttooikeusRef: React.MutableRefObject<HTMLDivElement>;
    oidHenkilo: string;
    isPalvelukayttaja: boolean;
};

const filterDate = (date: Date, isPalvelukayttaja: boolean) =>
    isPalvelukayttaja
        ? true
        : moment(date).isBefore(moment().add(1, 'years')) && moment(date).isAfter(moment().add(-1, 'days'));

const HenkiloViewCreateKayttooikeus = ({ existingKayttooikeusRef, isPalvelukayttaja, oidHenkilo }: OwnProps) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const [putKayttooikeusryhma] = usePutKayttooikeusryhmaForHenkiloMutation();
    const [selectedList, setSelectedList] = useState<ValittuKayttooikeusryhma[]>([]);
    const [organisationSelection, setOrganisationSelection] = useState<OrganisaatioSelectObject>();
    const [ryhmaSelection, setRyhmaSelection] = useState<SelectOption>();
    const [alkupvm, setAlkupvm] = useState<moment.Moment>(moment());
    const defaultLoppupvm = isPalvelukayttaja ? moment('2099-12-31', 'YYYY-MM-DD') : moment().add(1, 'years');
    const [loppupvmInput, setLoppupvmInput] = useState<moment.Moment>();
    const loppupvm = loppupvmInput ?? defaultLoppupvm;

    const selectRyhma = (selection: SelectOption) => {
        setOrganisationSelection(undefined);
        setRyhmaSelection(selection);
    };

    const selectOrganisation = (selection: OrganisaatioSelectObject) => {
        setOrganisationSelection(selection);
        setRyhmaSelection(undefined);
    };

    const resetValues = () => {
        setSelectedList([]);
        setOrganisationSelection(undefined);
        setRyhmaSelection(undefined);
        setAlkupvm(moment());
        setLoppupvmInput(undefined);
    };

    const createKayttooikeusAction = async () => {
        await putKayttooikeusryhma({
            henkiloOid: oidHenkilo,
            organisationOid: organisationSelection?.oid ?? ryhmaSelection?.value,
            body: selectedList.map((selected) => ({
                id: selected.value,
                kayttoOikeudenTila: 'MYONNA',
                alkupvm: moment(alkupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                loppupvm: moment(loppupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
            })),
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `kayttooikeus-${oidHenkilo}-${Math.random()}`,
                        header: L['NOTIFICATION_LISAA_KAYTTOOIKEUS_ONNISTUI'],
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
                        header: L['NOTIFICATION_LISAA_KAYTTOOIKEUS_EPAONNISTUI'],
                        type: 'error',
                    })
                );
            });
    };

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <div className="kayttooikeus-form-grid">
                <div className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</div>
                <div className="kayttooikeus-form-organisation-selection">
                    <OphDsOrganisaatioSelect
                        disabled={!!ryhmaSelection || !!selectedList?.length}
                        onChange={selectOrganisation}
                    />
                    <RyhmaSelection
                        selectOrganisaatio={selectRyhma}
                        selectedOrganisaatioOid={ryhmaSelection?.value}
                        disabled={!!organisationSelection || !!selectedList?.length}
                    />
                </div>
                <div className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_KESTO']}</div>
                <div>
                    <div className="kayttooikeus-input-container">
                        <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA']}</span>
                        <ReactDatePicker
                            className="oph-input"
                            onChange={(date) => setAlkupvm(moment(date))}
                            selected={alkupvm.toDate()}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) => filterDate(date, isPalvelukayttaja)}
                            dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                        />
                    </div>
                    <div className="kayttooikeus-input-container">
                        <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                        <ReactDatePicker
                            className="oph-input"
                            onChange={(date) => setLoppupvmInput(moment(date))}
                            selected={loppupvm.toDate()}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) => filterDate(date, isPalvelukayttaja)}
                            dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                        />
                    </div>
                </div>
                <div className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</div>
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
                                labelLocalised: L['HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID'],
                                isValid: !!organisationSelection || !!ryhmaSelection,
                            },
                            kayttooikeus: {
                                id: 'kayttooikeus',
                                labelLocalised: L['HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'],
                                isValid: !!selectedList?.length,
                            },
                        }}
                        buttonAction={createKayttooikeusAction}
                    >
                        {L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}
                    </ValidationMessageButton>
                </div>
            </div>
        </section>
    );
};

export default HenkiloViewCreateKayttooikeus;
