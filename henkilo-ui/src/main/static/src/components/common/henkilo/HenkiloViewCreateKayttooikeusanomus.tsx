import React, { useEffect, useMemo, useState } from 'react';
import Select, { createFilter } from 'react-select';

import { useAppDispatch } from '../../../store';
import Button from '../button/Button';
import IconButton from '../button/IconButton';
import CrossCircleIcon from '../icons/CrossCircleIcon';
import WideBlueNotification from '../../common/notifications/WideBlueNotification';
import KayttooikeusryhmaSelectModal from '../select/KayttooikeusryhmaSelectModal';
import Loader from '../icons/Loader';
import OrganisaatioSelectModal from '../select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { LocalNotification } from '../Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../Notification/notificationtypes';
import { OrganisaatioWithChildren } from '../../../types/domain/organisaatio/organisaatio.types';
import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { useLocalisations } from '../../../selectors';
import {
    useGetKayttooikeusryhmaOrganisaatiotQuery,
    useGetOmattiedotQuery,
    useGetOrganisaatioRyhmatQuery,
    useGetRootOrganisationQuery,
    usePostKayttooikeusAnomusMutation,
} from '../../../api/kayttooikeus';
import { FastMenuList, SelectOption } from '../../../utilities/select';
import { add } from '../../../slices/toastSlice';
import { useGetHenkiloQuery } from '../../../api/oppijanumerorekisteri';
import { Henkilo } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';

import './HenkiloViewCreateKayttooikeusanomus.css';

type KayttooikeusryhmaSelection = {
    value: number;
    label: string;
    description: string;
};

export const HenkiloViewCreateKayttooikeusanomus = (props: { henkiloOid: string }) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const { data: henkilo, isLoading } = useGetHenkiloQuery(props.henkiloOid);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [showInstructions, setShowInstructions] = useState(false);
    const [organisationSelection, setOrganisationSelection] = useState<OrganisaatioSelectObject>();
    const [ryhmaSelection, setRyhmaSelection] = useState<SelectOption>();
    const [activeSelection, setActiveSelection] = useState<string>();
    const { data: organisaatioKayttooikeusryhmat, isFetching } = useGetKayttooikeusryhmaOrganisaatiotQuery(
        activeSelection,
        {
            skip: !activeSelection,
        }
    );
    const [kayttooikeusryhmaSelections, setKayttooikeusryhmaSelections] = useState<KayttooikeusryhmaSelection[]>([]);
    const [perustelut, setPerustelut] = useState<string>();
    const [emailOptions, setEmailOptions] = useState(createEmailOptions(henkilo));
    const { data: rootOrganisation, isLoading: isRootOrganisationLoading } = useGetRootOrganisationQuery();
    const { data: ryhmat } = useGetOrganisaatioRyhmatQuery();
    const [postKayttooikeusAnomus] = usePostKayttooikeusAnomusMutation();

    const ryhmaOptions = useMemo(() => {
        return (ryhmat ?? [])
            .map((r) => ({
                label: r.nimi[locale] || r.nimi['fi'] || r.nimi['sv'] || r.nimi['en'] || '',
                value: r.oid,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [ryhmat]);

    const kayttooikeusryhmat = useMemo(() => {
        return (organisaatioKayttooikeusryhmat ?? []).filter(
            (kayttooikeusryhma) => !kayttooikeusryhmaSelections.find((k) => k.value === kayttooikeusryhma.id)
        );
    }, [organisaatioKayttooikeusryhmat]);

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo));
    }, [henkilo]);

    function createEmailOptions(henkilo: Henkilo) {
        const emailOptions = _parseEmailOptions(henkilo);
        if (emailOptions.length === 1) {
            return {
                emailSelection: emailOptions[0]?.value,
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
        setOrganisationSelection(organisaatioSelection);
        setRyhmaSelection(undefined);
        setActiveSelection(organisaatioSelection.oid);
    }

    function _changeRyhmaSelection(ryhmaSelection: SelectOption) {
        setOrganisationSelection(undefined);
        setRyhmaSelection(ryhmaSelection);
        setActiveSelection(ryhmaSelection?.value);
    }

    function validAnomusForm() {
        return !!activeSelection && _validKayttooikeusryhmaSelection() && _validEmailSelection() && perustelut;
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
        setOrganisationSelection(undefined);
        setRyhmaSelection(undefined);
        setKayttooikeusryhmaSelections([]);
        setPerustelut('');
        setEmailOptions(createEmailOptions(henkilo));
    }

    function _parseEmailOptions(henkilo: Henkilo): { value: string; label: string }[] {
        const emails: string[] = [];
        if (henkilo?.yhteystiedotRyhma) {
            henkilo.yhteystiedotRyhma.forEach((yhteystietoRyhma) => {
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
        postKayttooikeusAnomus({
            organisaatioOrRyhmaOid: activeSelection,
            email: emailOptions.emailSelection,
            perustelut: perustelut,
            kayttooikeusRyhmaIds: kayttooikeusryhmaSelections.map((selection) => selection.value),
            anojaOid: omattiedot.oidHenkilo,
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `anomus-ok-${Math.random()}`,
                        type: 'ok',
                        header: L['OMATTIEDOT_ANOMUKSEN_TALLENNUS_OK'],
                    })
                );
                _resetAnomusFormFields();
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `anomus-error-${Math.random()}`,
                        type: 'error',
                        header: L['OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS'],
                    })
                );
            });
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="kayttooikeus-anomus-wrapper">
            <h2>{L['OMATTIEDOT_OTSIKKO']}</h2>
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
                            value={organisationSelection?.name ?? ''}
                            placeholder={L['OMATTIEDOT_VALITSE_ORGANISAATIO']}
                            readOnly
                        />
                        <OrganisaatioSelectModal
                            organisaatiot={flatten(rootOrganisation)}
                            disabled={isRootOrganisationLoading || !!kayttooikeusryhmaSelections.length}
                            onSelect={_changeOrganisaatioSelection}
                        />
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text" />
                    <div className="oph-input-container">
                        <Select
                            onChange={_changeRyhmaSelection}
                            options={ryhmaOptions}
                            components={{ MenuList: FastMenuList }}
                            filterOption={createFilter({ ignoreAccents: false })}
                            value={ryhmaSelection}
                            placeholder={L['OMATTIEDOT_ANOMINEN_RYHMA']}
                            isDisabled={!!kayttooikeusryhmaSelections.length || emailOptions.missingEmail}
                            isClearable
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
                            <Select
                                placeholder={L['OMATTIEDOT_SAHKOPOSTI_VALINTA']}
                                options={emailOptions.options}
                                value={emailOptions.options.find((o) => o.value === emailOptions.emailSelection)}
                                onChange={(selection) =>
                                    setEmailOptions({ ...emailOptions, emailSelection: selection.value })
                                }
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
                            kayttooikeusryhmat={kayttooikeusryhmat}
                            kayttooikeusryhmaValittu={kayttooikeusryhmaSelections.length > 0}
                            onSelect={_addKayttooikeusryhmaSelection}
                            disabled={!activeSelection || emailOptions.missingEmail}
                            loading={isFetching}
                            isOrganisaatioSelected={!!activeSelection}
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
                                            {!activeSelection ? <li>{L['OMATTIEDOT_VAATIMUS_ORGANISAATIO']}</li> : null}
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
