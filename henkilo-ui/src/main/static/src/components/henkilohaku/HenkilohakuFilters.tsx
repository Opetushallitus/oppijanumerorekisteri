import './HenkilohakuFilters.css';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { OnChangeHandler, Options, Option } from 'react-select';

import { useAppDispatch, type RootState } from '../../store';
import OphCheckboxInline from '../common/forms/OphCheckboxInline';
import SubOrganisationCheckbox from './criterias/SubOrganisationCheckbox';
import NoOrganisationCheckbox from './criterias/NoOrganisationCheckbox';
import PassiivisetOrganisationCheckbox from './criterias/PassiivisetOrganisationCheckbox';
import DuplikaatitOrganisationCheckbox from './criterias/DuplikaatitOrganisationCheckbox';
import OphSelect from '../common/select/OphSelect';
import { fetchAllKayttooikeusryhma } from '../../actions/kayttooikeusryhma.actions';
import StaticUtils from '../common/StaticUtils';
import CloseButton from '../common/button/CloseButton';
import { HenkilohakuCriteria } from '../../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { Kayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { useLocalisations } from '../../selectors';
import { useGetHenkiloHakuOrganisaatiotQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { OrganisaatioWithChildren } from '../../types/domain/organisaatio/organisaatio.types';

type OwnProps = {
    ryhmaSelectionAction: OnChangeHandler<string, Option<string> | Options<string>>;
    selectedRyhma: string | undefined;
    selectedOrganisation?: Array<string> | string;
    selectedKayttooikeus: string | undefined;
    duplikaatitAction: () => void;
    passiivisetAction: () => void;
    subOrganisationAction: () => void;
    noOrganisationAction: () => void;
    organisaatioSelectAction: (arg0: OrganisaatioSelectObject) => void;
    clearOrganisaatioSelection: () => void;
    kayttooikeusSelectionAction: OnChangeHandler<string, Options<string> | Option<string>>;
    initialValues: HenkilohakuCriteria;
};

const HenkilohakuFilters = (props: OwnProps) => {
    const [organisaatioSelection, setOrganisaatioSelection] = useState('');
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();
    const allKayttooikeusryhmas = useSelector<RootState, Kayttooikeusryhma[]>(
        (state) => state.kayttooikeus.allKayttooikeusryhmas
    );
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: henkilohakuOrganisaatiot, isLoading } = useGetHenkiloHakuOrganisaatiotQuery(omattiedot?.oidHenkilo, {
        skip: !omattiedot,
    });

    const ryhmaOptions = useMemo(() => {
        return _parseRyhmaOptions(henkilohakuOrganisaatiot ?? []);
    }, [henkilohakuOrganisaatiot]);

    const kayttooikeusryhmas = useMemo(() => {
        return allKayttooikeusryhmas
            .filter((kayttooikeusryhma) => !kayttooikeusryhma.passivoitu)
            .map((kayttooikeusryhma) => ({
                value: `${kayttooikeusryhma.id}`,
                label: StaticUtils.getLocalisedText(kayttooikeusryhma.description, locale),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allKayttooikeusryhmas]);

    useEffect(() => {
        dispatch<any>(fetchAllKayttooikeusryhma());
    }, []);

    const clearOrganisaatioSelection = () => {
        setOrganisaatioSelection('');
        props.clearOrganisaatioSelection();
    };

    const organisaatioSelectAction = (organisaatio: OrganisaatioSelectObject): void => {
        setOrganisaatioSelection(organisaatio.name);
        props.organisaatioSelectAction(organisaatio);
    };

    function _parseRyhmaOptions(organisaatiot: Array<OrganisaatioHenkilo>): Options<string> {
        return organisaatiot
            .reduce<OrganisaatioWithChildren[]>(
                (acc, organisaatio) => acc.concat([organisaatio.organisaatio], organisaatio.organisaatio.children),
                []
            )
            .filter((organisaatio) => organisaatio.tyypit.some((tyyppi) => tyyppi === 'Ryhma'))
            .map((ryhma) => ({
                label: ryhma.nimi[locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                value: ryhma.oid,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    return (
        <div className="henkilohakufilters-wrapper">
            <OphCheckboxInline text={L['HENKILOHAKU_FILTERS_HAEMYOS']}>
                {omattiedot?.isAdmin ? (
                    <div className="flex-inline">
                        <SubOrganisationCheckbox
                            L={L}
                            subOrganisationValue={props.initialValues.subOrganisation}
                            subOrganisationAction={props.subOrganisationAction}
                        />
                        <NoOrganisationCheckbox
                            L={L}
                            noOrganisationValue={props.initialValues.noOrganisation}
                            noOrganisationAction={props.noOrganisationAction}
                        />
                        <PassiivisetOrganisationCheckbox
                            L={L}
                            passiivisetValue={props.initialValues.passivoitu}
                            passiivisetAction={props.passiivisetAction}
                        />
                        <DuplikaatitOrganisationCheckbox
                            L={L}
                            duplikaatitValue={props.initialValues.duplikaatti}
                            duplikaatitAction={props.duplikaatitAction}
                        />
                    </div>
                ) : (
                    <div className="flex-inline">
                        <SubOrganisationCheckbox
                            L={L}
                            subOrganisationValue={props.initialValues.subOrganisation}
                            subOrganisationAction={props.subOrganisationAction}
                        />
                    </div>
                )}
            </OphCheckboxInline>

            <div className="flex-horizontal flex-align-center henkilohaku-suodata">
                <div className="flex-item-1">
                    <div className="henkilohaku-select">
                        <input
                            className="oph-input flex-item-1 henkilohaku-organisaatiosuodatus"
                            type="text"
                            value={organisaatioSelection}
                            placeholder={L['HENKILOHAKU_ORGANISAATIOSUODATUS']}
                            readOnly
                        />
                        <OrganisaatioSelectModal
                            disabled={isLoading || henkilohakuOrganisaatiot?.length === 0}
                            onSelect={organisaatioSelectAction}
                            organisaatiot={henkilohakuOrganisaatiot}
                        />
                        <span className="henkilohaku-clear-select">
                            <CloseButton closeAction={() => clearOrganisaatioSelection()} />
                        </span>
                    </div>
                </div>
                <div className="flex-item-1">
                    <div className="henkilohaku-select">
                        <span className="flex-item-1">
                            <OphSelect
                                id="kayttooikeusryhmaFilter"
                                options={kayttooikeusryhmas}
                                value={props.selectedKayttooikeus}
                                placeholder={L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                                onChange={props.kayttooikeusSelectionAction}
                            />
                        </span>
                        <span className="henkilohaku-clear-select">
                            <CloseButton closeAction={() => props.kayttooikeusSelectionAction({ value: undefined })} />
                        </span>
                    </div>
                </div>
            </div>
            {ryhmaOptions.length > 0 && (
                <div className="flex-horizontal flex-align-center henkilohaku-suodata">
                    <div className="flex-item-1">
                        <div className="henkilohaku-select">
                            <span className="flex-item-1">
                                <OphSelect
                                    id="ryhmaFilter"
                                    options={ryhmaOptions}
                                    value={props.selectedRyhma}
                                    placeholder={L['HENKILOHAKU_FILTERS_RYHMA_PLACEHOLDER']}
                                    onChange={props.ryhmaSelectionAction}
                                />
                            </span>
                            <span className="henkilohaku-clear-select">
                                <CloseButton closeAction={() => props.ryhmaSelectionAction({ value: undefined })} />
                            </span>
                        </div>
                    </div>
                    <div className="flex-item-1" />
                </div>
            )}
        </div>
    );
};

export default HenkilohakuFilters;
