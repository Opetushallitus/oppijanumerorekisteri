import React, { useState } from 'react';
import moment from 'moment';
import ReactDatePicker from 'react-datepicker';

import { useAppDispatch } from '../../../store';
import CKKayttooikeudet, { ValittuKayttooikeusryhma } from './createkayttooikeus/CKKayttooikeudet';
import { addKayttooikeusToHenkilo } from '../../../actions/kayttooikeusryhma.actions';
import PropertySingleton from '../../../globals/PropertySingleton';
import { useLocalisations } from '../../../selectors';
import { SelectOption } from '../../../utilities/select';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { OphDsOrganisaatioSelect } from '../../design-system/OphDsOrganisaatioSelect';
import RyhmaSelection from '../select/RyhmaSelection';
import ValidationMessageButton from '../button/ValidationMessageButton';

import './HenkiloViewCreateKayttooikeus.css';

type OwnProps = {
    vuosia: number;
    existingKayttooikeusRef: React.MutableRefObject<HTMLDivElement>;
    oidHenkilo: string;
    isPalvelukayttaja: boolean;
};

type State = {
    selectedList: Array<ValittuKayttooikeusryhma>;
    organisationSelection?: OrganisaatioSelectObject;
    ryhmaSelection?: SelectOption;
    alkupvm: moment.Moment;
    loppupvm: moment.Moment;
};

const HenkiloViewCreateKayttooikeus = ({
    existingKayttooikeusRef,
    isPalvelukayttaja,
    oidHenkilo,
    vuosia,
}: OwnProps) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const initialForm: State = {
        selectedList: [],
        organisationSelection: undefined,
        ryhmaSelection: undefined,
        alkupvm: moment(),
        loppupvm: isPalvelukayttaja ? moment('2099-12-31', 'YYYY-MM-DD') : moment().add(vuosia, 'years'),
    };
    const [form, setForm] = useState(initialForm);
    const [validationMessages, setValidationMessages] = useState({
        organisation: {
            id: 'organisation',
            labelLocalised: L['HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID'],
            isValid: false,
        },
        kayttooikeus: {
            id: 'kayttooikeus',
            labelLocalised: L['HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'],
            isValid: false,
        },
    });

    const selectRyhma = (ryhmaSelection: SelectOption) => {
        setValidationMessages({
            ...validationMessages,
            organisation: {
                ...validationMessages.organisation,
                isValid: !!ryhmaSelection,
            },
        });
        setForm({
            ...form,
            organisationSelection: undefined,
            ryhmaSelection,
        });
    };

    const selectOrganisation = (organisationSelection: OrganisaatioSelectObject) => {
        setValidationMessages({
            ...validationMessages,
            organisation: {
                ...validationMessages.organisation,
                isValid: !!organisationSelection,
            },
        });
        setForm({
            ...form,
            organisationSelection,
            ryhmaSelection: undefined,
        });
    };

    const addKayttooikeus = (value: ValittuKayttooikeusryhma) => {
        if (value.value) {
            setForm({ ...form, selectedList: [...form.selectedList, value] });
        }
        setValidationMessages({
            ...validationMessages,
            kayttooikeus: {
                ...validationMessages.kayttooikeus,
                isValid: true,
            },
        });
    };

    const removeKayttooikeus = (kayttooikeusId: number) => {
        const selectedList = form.selectedList.filter((selected) => selected.value !== kayttooikeusId);
        const id = 'kayttooikeus';
        const labelLocalised = L['HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'];
        if (validationMessages[id] === undefined || !selectedList.length) {
            setValidationMessages({
                ...validationMessages,
                kayttooikeus: { id, labelLocalised, isValid: false },
            });
        }
        setForm({ ...form, selectedList });
    };

    const createKayttooikeusAction = () => {
        dispatch<any>(
            addKayttooikeusToHenkilo(
                oidHenkilo,
                form.organisationSelection?.oid ?? form.ryhmaSelection?.value,
                form.selectedList.map((selected) => ({
                    id: selected.value,
                    kayttoOikeudenTila: 'MYONNA',
                    alkupvm: moment(form.alkupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                    loppupvm: moment(form.loppupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                }))
            )
        );
        setForm(initialForm);
        existingKayttooikeusRef.current?.scrollIntoView(true);
    };

    return (
        <div className="henkiloViewUserContentWrapper">
            <h2>{L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <div className="kayttooikeus-form-grid">
                <div className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</div>
                <div className="kayttooikeus-form-organisation-selection">
                    <OphDsOrganisaatioSelect
                        disabled={!!form.ryhmaSelection || !!form.selectedList?.length}
                        onChange={selectOrganisation}
                    />
                    <RyhmaSelection
                        selectOrganisaatio={selectRyhma}
                        selectedOrganisaatioOid={form.ryhmaSelection?.value}
                        disabled={!!form.organisationSelection || !!form.selectedList?.length}
                    />
                </div>
                <div className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_KESTO']}</div>
                <div>
                    <div className="kayttooikeus-input-container">
                        <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA']}</span>
                        <ReactDatePicker
                            className="oph-input"
                            onChange={(date) => setForm({ ...form, alkupvm: moment(date) })}
                            selected={form.alkupvm.toDate()}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) =>
                                vuosia !== null ? moment(date).isBefore(moment().add(vuosia, 'years')) : true
                            }
                            dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                        />
                    </div>
                    <div className="kayttooikeus-input-container">
                        <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                        <ReactDatePicker
                            className="oph-input"
                            onChange={(date) => setForm({ ...form, alkupvm: moment(date) })}
                            selected={form.loppupvm.toDate()}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) =>
                                vuosia !== null ? moment(date).isBefore(moment().add(vuosia, 'years')) : true
                            }
                            dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                        />
                    </div>
                </div>
                <div className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</div>
                <div>
                    <CKKayttooikeudet
                        selectedList={form.selectedList}
                        removeKayttooikeus={removeKayttooikeus}
                        addKayttooikeus={addKayttooikeus}
                        selectedOrganisationOid={form.organisationSelection?.oid ?? form.ryhmaSelection?.value}
                        isPalvelukayttaja={isPalvelukayttaja}
                    />
                </div>
                <div></div>
                <div>
                    <ValidationMessageButton
                        validationMessages={validationMessages}
                        buttonAction={createKayttooikeusAction}
                    >
                        {L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}
                    </ValidationMessageButton>
                </div>
            </div>
        </div>
    );
};

export default HenkiloViewCreateKayttooikeus;
