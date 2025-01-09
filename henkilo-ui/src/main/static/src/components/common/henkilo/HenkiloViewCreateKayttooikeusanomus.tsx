import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Option } from 'react-select';

import { useAppDispatch, type RootState } from '../../../store';
import OphSelect from '../select/OphSelect';
import Button from '../button/Button';
import IconButton from '../button/IconButton';
import CrossCircleIcon from '../icons/CrossCircleIcon';
import WideBlueNotification from '../../common/notifications/WideBlueNotification';
import KayttooikeusryhmaSelectModal from '../select/KayttooikeusryhmaSelectModal';
import Loader from '../icons/Loader';
import {
    createKayttooikeusanomus,
    fetchOrganisaatioKayttooikeusryhmat,
    fetchAllKayttooikeusAnomusForHenkilo,
} from '../../../actions/kayttooikeusryhma.actions';
import { addGlobalNotification } from '../../../actions/notification.actions';
import OrganisaatioSelectModal from '../select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { LocalNotification } from '../Notification/LocalNotification';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { NOTIFICATIONTYPES } from '../Notification/notificationtypes';
import { OrganisaatioWithChildren } from '../../../types/domain/organisaatio/organisaatio.types';
import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { useLocalisations } from '../../../selectors';
import { OrganisaatioState } from '../../../reducers/organisaatio.reducer';
import { OrganisaatioKayttooikeusryhmatState } from '../../../reducers/organisaatiokayttooikeusryhmat.reducer';
import { useGetOmattiedotQuery } from '../../../api/kayttooikeus';

import './HenkiloViewCreateKayttooikeusanomus.css';

type OwnProps = {
    ryhmaOptions: Array<{ label: string; value: string }>;
    kayttooikeusryhmat: Array<Kayttooikeusryhma>;
};

type KayttooikeusryhmaSelection = {
    value: number;
    label: string;
    description: string;
};

type SelectionState = {
    selectedOid?: string;
    ryhmaSelection?: Option<string>;
    organisaatioSelection?: OrganisaatioSelectObject;
};

const initialSelectionState = {
    selectedOid: undefined,
    ryhmaSelection: undefined,
    organisaatioSelection: undefined,
};

export const HenkiloViewCreateKayttooikeusanomus = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const organisaatio = useSelector<RootState, OrganisaatioState>((state) => state.organisaatio);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const organisaatioKayttooikeusryhmat = useSelector<RootState, OrganisaatioKayttooikeusryhmatState>(
        (state) => state.OrganisaatioKayttooikeusryhmat
    );

    const [showInstructions, setShowInstructions] = useState(false);
    const [selectionState, setSelectionState] = useState<SelectionState>(initialSelectionState);
    const [kayttooikeusryhmaSelections, setKayttooikeusryhmaSelections] = useState<KayttooikeusryhmaSelection[]>([]);
    const [perustelut, setPerustelut] = useState<string>();
    const [emailOptions, setEmailOptions] = useState(createEmailOptions(henkilo));

    const ryhmaOptions = useMemo(() => {
        const options = [...props.ryhmaOptions];
        options.sort((a, b) => a.label.localeCompare(b.label));
        return options;
    }, [props.ryhmaOptions]);

    const kayttooikeusryhmat = useMemo(() => {
        return props.kayttooikeusryhmat.filter(
            (kayttooikeusryhma) => !kayttooikeusryhmaSelections.find((k) => k.value === kayttooikeusryhma.id)
        );
    }, [props.kayttooikeusryhmat]);

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo));
    }, [henkilo]);

    function createEmailOptions(henkilo: HenkiloState) {
        const emailOptions = _parseEmailOptions(henkilo);
        if (emailOptions.length === 1) {
            return {
                emailSelection: emailOptions[0].value,
                missingEmail: false,
                showMissingEmailNotification: false,
            };
        } else if (emailOptions.length > 1) {
            return {
                missingEmail: false,
                showMissingEmailNotification: false,
                emailSelection: '',
                options: emailOptions,
            };
        }
        return { missingEmail: true, showMissingEmailNotification: true };
    }

    function _changeOrganisaatioSelection(organisaatioSelection: OrganisaatioSelectObject) {
        setSelectionState({
            selectedOid: organisaatioSelection.oid,
            organisaatioSelection,
            ryhmaSelection: undefined,
        });
        dispatch<any>(fetchOrganisaatioKayttooikeusryhmat(organisaatioSelection.oid));
    }

    function _changeRyhmaSelection(ryhmaSelection: Option<string>) {
        setSelectionState({
            selectedOid: ryhmaSelection.value,
            organisaatioSelection: undefined,
            ryhmaSelection,
        });
        dispatch<any>(fetchOrganisaatioKayttooikeusryhmat(ryhmaSelection.value));
    }

    function validAnomusForm() {
        return (
            !!selectionState.selectedOid && _validKayttooikeusryhmaSelection() && _validEmailSelection() && perustelut
        );
    }

    function _validKayttooikeusryhmaSelection() {
        return kayttooikeusryhmaSelections.length > 0;
    }

    function _validEmailSelection() {
        return emailOptions && emailOptions.emailSelection !== '' && !emailOptions.missingEmail;
    }

    function flatten(root: OrganisaatioWithChildren): OrganisaatioHenkilo[] {
        return root ? [{ organisaatio: root }, ...root.children.flatMap((node) => flatten(node))] : [];
    }

    function _resetAnomusFormFields() {
        setShowInstructions(false);
        setSelectionState(initialSelectionState);
        setKayttooikeusryhmaSelections([]);
        setPerustelut('');
        setEmailOptions(createEmailOptions(henkilo));
    }

    function _parseEmailOptions(henkilo: HenkiloState): { value: string; label: string }[] {
        const emails = [];
        if (henkilo.henkilo.yhteystiedotRyhma) {
            henkilo.henkilo.yhteystiedotRyhma.forEach((yhteystietoRyhma) => {
                yhteystietoRyhma.yhteystieto.forEach((yhteys) => {
                    if (yhteys.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI') {
                        emails.push(yhteys.yhteystietoArvo);
                    }
                });
            });
        }
        return emails.map((email) => ({ value: email ?? '', label: email ?? '' }));
    }

    function _addKayttooikeusryhmaSelection(kayttooikeusryhma: Kayttooikeusryhma) {
        const l = locale.toUpperCase();
        setKayttooikeusryhmaSelections([
            ...kayttooikeusryhmaSelections,
            {
                value: kayttooikeusryhma.id,
                label: kayttooikeusryhma.nimi.texts?.find((t) => t.lang === l)?.text,
                description: kayttooikeusryhma.kuvaus?.texts?.find((t) => t.lang === l)?.text,
            },
        ]);
    }

    function _removeKayttooikeusryhmaSelection(kayttooikeusryhmaSelection: { value: number }) {
        setKayttooikeusryhmaSelections(
            kayttooikeusryhmaSelections.filter((selection) => selection.value !== kayttooikeusryhmaSelection.value)
        );
    }

    async function _createKayttooikeusAnomus() {
        try {
            await dispatch<any>(
                createKayttooikeusanomus({
                    organisaatioOrRyhmaOid: selectionState.selectedOid,
                    email: emailOptions.emailSelection,
                    perustelut: perustelut,
                    kayttooikeusRyhmaIds: kayttooikeusryhmaSelections.map((selection) => selection.value),
                    anojaOid: omattiedot.oidHenkilo,
                })
            );
            dispatch(
                addGlobalNotification({
                    key: 'OMATTIEDOT_ANOMUKSEN_TALLENNUS_OK',
                    type: NOTIFICATIONTYPES.SUCCESS,
                    title: L['OMATTIEDOT_ANOMUKSEN_TALLENNUS_OK'],
                    autoClose: 5000,
                })
            );
        } catch (error) {
            dispatch(
                addGlobalNotification({
                    key: 'OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS',
                    type: NOTIFICATIONTYPES.ERROR,
                    title: L['OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS'],
                    autoClose: 10000,
                })
            );
            throw error;
        }
        _resetAnomusFormFields();
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.oidHenkilo));
    }

    return henkilo.henkiloLoading ? (
        <Loader />
    ) : (
        <div className="kayttooikeus-anomus-wrapper">
            <div className="header">
                <span className="oph-h2 oph-bold">{L['OMATTIEDOT_OTSIKKO']}</span>
            </div>
            {emailOptions.showMissingEmailNotification ? (
                <WideBlueNotification
                    message={L['OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_UUSI_ANOMUS']}
                    closeAction={() => {
                        setEmailOptions({ ...emailOptions, showMissingEmailNotification: false });
                    }}
                />
            ) : null}

            <div onClick={() => setShowInstructions(!showInstructions)}>
                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                        {L['OMATTIEDOT_ORGANISAATIO_TAI_RYHMA']}*
                    </label>

                    <div className="oph-input-container flex-horizontal">
                        <input
                            className="oph-input flex-item-1 kutsutut-organisaatiosuodatus"
                            type="text"
                            value={selectionState.organisaatioSelection?.name ?? ''}
                            placeholder={L['OMATTIEDOT_VALITSE_ORGANISAATIO']}
                            readOnly
                        />
                        <OrganisaatioSelectModal
                            organisaatiot={flatten(organisaatio.organisaatioHierarkia)}
                            disabled={organisaatio.organisaatioHierarkiaLoading}
                            onSelect={_changeOrganisaatioSelection}
                        />
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text" />
                    <div className="oph-input-container">
                        <OphSelect
                            onChange={_changeRyhmaSelection}
                            options={ryhmaOptions}
                            value={selectionState.ryhmaSelection?.value}
                            placeholder={L['OMATTIEDOT_ANOMINEN_RYHMA']}
                            disabled={emailOptions.missingEmail}
                        />
                    </div>
                </div>

                {emailOptions.options && emailOptions.options.length > 1 ? (
                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label oph-bold oph-label-long"
                            htmlFor="email"
                            aria-describedby="field-text"
                        >
                            {L['OMATTIEDOT_SAHKOPOSTIOSOITE']}*
                        </label>

                        <div className="oph-input-container">
                            <OphSelect
                                placeholder={L['OMATTIEDOT_SAHKOPOSTI_VALINTA']}
                                options={emailOptions.options}
                                value={emailOptions.emailSelection}
                                onChange={(selection) =>
                                    setEmailOptions({ ...emailOptions, emailSelection: selection.value })
                                }
                                onBlurResetsInput={false}
                                noResultsText={L['OMATTIEDOT_HAE_OLEMASSAOLEVA_SAHKOPOSTI']}
                            />
                        </div>
                    </div>
                ) : null}

                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                        {L['OMATTIEDOT_ANOTTAVAT']}*
                    </label>

                    <div className="oph-input-container kayttooikeus-selection-wrapper">
                        <KayttooikeusryhmaSelectModal
                            locale={locale}
                            L={L}
                            kayttooikeusryhmat={kayttooikeusryhmat}
                            kayttooikeusryhmaValittu={kayttooikeusryhmaSelections.length > 0}
                            onSelect={_addKayttooikeusryhmaSelection}
                            disabled={emailOptions.missingEmail}
                            loading={organisaatioKayttooikeusryhmat.kayttooikeusryhmatLoading}
                            isOrganisaatioSelected={!!selectionState.selectedOid}
                            sallittuKayttajatyyppi="VIRKAILIJA"
                        />
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text"></label>
                    <div className="oph-input-container">
                        <ul className="selected-permissions">
                            {kayttooikeusryhmaSelections.map((kayttooikeusRyhmaSelection, index) => {
                                return (
                                    <li key={index}>
                                        <div className="selected-permissions-name">
                                            {kayttooikeusRyhmaSelection.label}
                                            <IconButton
                                                onClick={() =>
                                                    _removeKayttooikeusryhmaSelection(kayttooikeusRyhmaSelection)
                                                }
                                            >
                                                <CrossCircleIcon />
                                            </IconButton>
                                        </div>
                                        {kayttooikeusRyhmaSelection.description && (
                                            <div className="selected-permissions-description">
                                                {kayttooikeusRyhmaSelection.description}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label
                        className="oph-label oph-bold oph-label-long"
                        htmlFor="perustelut"
                        aria-describedby="field-text"
                    >
                        {L['OMATTIEDOT_PERUSTELUT']}
                    </label>

                    <div className="oph-input-container">
                        <textarea
                            className="oph-input"
                            value={perustelut}
                            onChange={(event) => setPerustelut(event.target.value)}
                            name="perustelut"
                            id="perustelut"
                            cols={30}
                            rows={10}
                            maxLength={255}
                            placeholder={L['OMATTIEDOT_PERUSTELU_VIRHE']}
                            disabled={emailOptions.missingEmail}
                        />
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text" />
                    <div className="oph-input-container">
                        <div className="anomus-button">
                            <Button action={_createKayttooikeusAnomus} disabled={!validAnomusForm()}>
                                {L['OMATTIEDOT_HAE_BUTTON']}
                            </Button>
                        </div>

                        <div className="anomus-form-errors flex-horizontal">
                            <div className="flex-item-1">
                                {showInstructions && (
                                    <LocalNotification
                                        title={L['OMATTIEDOT_ANOMINEN_VIRHEET']}
                                        toggle={!validAnomusForm()}
                                        type={NOTIFICATIONTYPES.WARNING}
                                    >
                                        <ul>
                                            {!selectionState.selectedOid ? (
                                                <li>{L['OMATTIEDOT_VAATIMUS_ORGANISAATIO']}</li>
                                            ) : null}
                                            {!_validKayttooikeusryhmaSelection() ? (
                                                <li>{L['OMATTIEDOT_VAATIMUS_KAYTTOOIKEUDET']}</li>
                                            ) : null}
                                            {!_validEmailSelection() ? <li>{L['OMATTIEDOT_VAATIMUS_EMAIL']}</li> : null}
                                            {!perustelut ? <li>{L['OMATTIEDOT_PERUSTELU_VIRHE']}</li> : null}
                                        </ul>
                                    </LocalNotification>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
