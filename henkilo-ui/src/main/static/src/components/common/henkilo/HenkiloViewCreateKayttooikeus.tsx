import React, { useId, useState } from 'react';
import { addYears, format, parseISO } from 'date-fns';
import { SingleValue } from 'react-select';
import { skipToken } from '@reduxjs/toolkit/query';

import { useLocalisations } from '../../../selectors';
import { SelectOption } from '../../../utilities/select';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { OphDsBanner } from '../../design-system/OphDsBanner';
import { OphDsDatepicker } from '../../design-system/OphDsDatePicker';
import { OphDsOrganisaatioSelect } from '../../design-system/OphDsOrganisaatioSelect';
import { OphDsRyhmaSelect } from '../../design-system/OphDsRyhmaSelect';
import {
    useGetAllowedKayttooikeusryhmasForOrganisationQuery,
    usePutKayttooikeusryhmaForHenkiloMutation,
} from '../../../api/kayttooikeus';
import { add } from '../../../slices/toastSlice';
import { useAppDispatch } from '../../../store';
import { myonnettyToKayttooikeusryhma } from '../../../utilities/kayttooikeusryhma.utils';
import KayttooikeusryhmaSelectModal from '../select/KayttooikeusryhmaSelectModal';
import { getTextGroupLocalisation } from '../../../utilities/localisation.util';

import styles from './HenkiloViewCreateKayttooikeus.module.css';

type OwnProps = {
    existingKayttooikeusRef: React.RefObject<HTMLDivElement>;
    oidHenkilo: string;
    isPalvelukayttaja?: boolean;
};

const HenkiloViewCreateKayttooikeus = ({ existingKayttooikeusRef, isPalvelukayttaja, oidHenkilo }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();
    const [putKayttooikeusryhma] = usePutKayttooikeusryhmaForHenkiloMutation();
    const [selectedList, setSelectedList] = useState<{ label: string; value: number }[]>([]);
    const [organisationSelection, setOrganisationSelection] = useState<SingleValue<OrganisaatioSelectObject>>();
    const [ryhmaSelection, setRyhmaSelection] = useState<SingleValue<SelectOption>>(null);
    const [alkupvm, setAlkupvm] = useState<Date>(new Date());
    const defaultLoppupvm = isPalvelukayttaja ? parseISO('2099-12-31') : addYears(new Date(), 1);
    const [loppupvmInput, setLoppupvmInput] = useState<Date>();
    const loppupvm = loppupvmInput ?? defaultLoppupvm;
    const oidOrganisaatio = organisationSelection?.oid ?? ryhmaSelection?.value;
    const { data, isLoading } = useGetAllowedKayttooikeusryhmasForOrganisationQuery(
        oidOrganisaatio ? { oidHenkilo, oidOrganisaatio } : skipToken
    );
    const kayttooikeusryhmat =
        data
            ?.filter((myonnetty) => selectedList.every((selected) => selected.value !== myonnetty.ryhmaId))
            .map(myonnettyToKayttooikeusryhma) ?? [];

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
            <div className={styles.kayttooikeusFormGrid}>
                <div className="oph-ds-label">{L('HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE')}</div>
                <div className={styles.kayttooikeusFormOrganisationSelection}>
                    <OphDsOrganisaatioSelect
                        inputId="lisaaKayttooikeusValitseOrganisaatio"
                        disabled={!!ryhmaSelection || !!selectedList?.length}
                        onChange={selectOrganisation}
                    />
                    <OphDsRyhmaSelect
                        inputId="lisaaKayttooikeusValitseRyhma"
                        selectOrganisaatio={selectRyhma}
                        selectedOrganisaatioOid={ryhmaSelection?.value}
                        disabled={!!organisationSelection || !!selectedList?.length}
                    />
                </div>
                <div className="oph-ds-label">{L('HENKILO_LISAA_KAYTTOOIKEUDET_KESTO')}</div>
                <div className={styles.dateSelection}>
                    <div>
                        <label className="oph-ds-label" htmlFor="lisaa-kayttooikeus-alkupvm">
                            {L('HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA')}
                        </label>
                        <OphDsDatepicker
                            id="lisaa-kayttooikeus-alkupvm"
                            onChange={(date: Date | null) => setAlkupvm(date ?? new Date())}
                            selected={alkupvm}
                            minDate={new Date()}
                            maxDate={addYears(new Date(), isPalvelukayttaja ? 100 : 1)}
                            isClearable={false}
                        />
                    </div>
                    <div>
                        <label className="oph-ds-label" htmlFor="lisaa-kayttooikeus-loppupvm">
                            {L('HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY')}
                        </label>
                        <OphDsDatepicker
                            id="lisaa-kayttooikeus-loppupvm"
                            onChange={(date: Date | null) => date && setLoppupvmInput(date)}
                            selected={loppupvm}
                            minDate={new Date()}
                            maxDate={addYears(new Date(), isPalvelukayttaja ? 100 : 1)}
                            isClearable={false}
                        />
                    </div>
                </div>
                <div className="oph-ds-label">{L('HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT')}</div>
                <div className={styles.kayttooikeusSelection}>
                    <div>
                        <KayttooikeusryhmaSelectModal
                            kayttooikeusryhmat={kayttooikeusryhmat}
                            kayttooikeusryhmaValittu={selectedList.length > 0}
                            onSelect={(k) =>
                                setSelectedList([
                                    ...selectedList,
                                    {
                                        value: k.id,
                                        label: getTextGroupLocalisation(k.nimi, locale),
                                    },
                                ])
                            }
                            disabled={isLoading || !oidOrganisaatio}
                            loading={isLoading}
                            isOrganisaatioSelected={!!oidOrganisaatio}
                            sallittuKayttajatyyppi={isPalvelukayttaja ? 'PALVELU' : 'VIRKAILIJA'}
                        />
                    </div>
                    <div className={styles.selectedKayttooikeus}>
                        {selectedList.map((selected, idx) => (
                            <div data-testid={`kayttooikeusSelected-${selected.label.trim()}`} key={idx}>
                                <span>{selected.label}</span>
                                <button
                                    data-testid={`kayttooikeusRemoveSelected-${selected.label.trim()}`}
                                    title={L('POISTA')}
                                    className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                                    disabled={!oidOrganisaatio}
                                    onClick={() =>
                                        setSelectedList(selectedList.filter((s) => selected.value !== s.value))
                                    }
                                ></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div></div>
                <div>
                    {((!organisationSelection && !ryhmaSelection) || !selectedList?.length) && (
                        <div data-testid="kayttooikeusValidationWarningBanner" style={{ marginBottom: '1rem' }}>
                            <OphDsBanner type="warning">
                                <ul>
                                    {!organisationSelection && !ryhmaSelection && (
                                        <li data-testid="kayttooikeusOrgSelectionInvalid">
                                            {L('HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID')}
                                        </li>
                                    )}
                                    {!selectedList?.length && (
                                        <li data-testid="kayttooikeusSelectedCountMinInvalid">
                                            {L('HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID')}
                                        </li>
                                    )}
                                </ul>
                            </OphDsBanner>
                        </div>
                    )}
                    <div>
                        <button
                            data-testid="kayttooikeusTallenna"
                            className="oph-ds-button"
                            disabled={(!organisationSelection && !ryhmaSelection) || !selectedList?.length}
                            onClick={() => createKayttooikeusAction()}
                        >
                            {L('HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HenkiloViewCreateKayttooikeus;
