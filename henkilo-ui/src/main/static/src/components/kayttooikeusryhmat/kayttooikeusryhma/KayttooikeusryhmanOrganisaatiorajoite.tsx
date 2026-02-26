import React, { useMemo } from 'react';

import ItemList from './ItemList';
import './KayttooikeusryhmanOrganisaatiorajoite.css';
import OrganisaatioSelectModal from '../../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { useLocalisations } from '../../../selectors';
import { koodiLabel, useGetOppilaitostyypitQuery, useGetOrganisaatiotyypitQuery } from '../../../api/koodisto';

type Props = {
    ryhmaRestriction: boolean;
    toggleRyhmaRestriction: () => void;
    organisaatioSelections: OrganisaatioSelectObject[];
    organisaatioSelectAction: (organisaatio: OrganisaatioSelectObject) => void;
    removeOrganisaatioSelectAction: (selection: OrganisaatioSelectObject) => void;
    oppilaitostyypitSelections: string[];
    oppilaitostyypitSelectAction: React.ReactEventHandler<HTMLInputElement>;
    organisaatiotyypitSelections: string[];
    organisaatiotyypitSelectAction: React.ReactEventHandler<HTMLInputElement>;
};

const KayttooikeusryhmanOrganisaatiorajoite = (props: Props) => {
    const { L, locale } = useLocalisations();
    const { data: oppilaitostyypit } = useGetOppilaitostyypitQuery();
    const { data: organisaatiotyypit } = useGetOrganisaatiotyypitQuery();
    const oppilaitostyypitOptions = useMemo(() => {
        return (oppilaitostyypit ?? []).map((oppilaitostyyppi) => ({
            label: koodiLabel(oppilaitostyyppi, locale) ?? oppilaitostyyppi.koodiUri,
            value: oppilaitostyyppi.koodiUri,
        }));
    }, [oppilaitostyypit]);
    const organisaatiotyypitOptions = useMemo(() => {
        return (organisaatiotyypit ?? []).map((organisaatiotyyppi) => ({
            label: koodiLabel(organisaatiotyyppi, locale) ?? organisaatiotyyppi.koodiUri,
            value: organisaatiotyyppi.koodiUri,
        }));
    }, [organisaatiotyypit]);

    return (
        <div className="kayttooikeusryhman-myonto-kohde">
            <h4>{L('KAYTTOOIKEUSRYHMAT_LISAA_ORGANISAATIORAJOITE_OTSIKKO')}</h4>
            <label className="oph-checkable" htmlFor="ryhmarestriction">
                <input
                    id="ryhmarestriction"
                    className="oph-checkable-input"
                    type="checkbox"
                    onChange={props.toggleRyhmaRestriction}
                    checked={props.ryhmaRestriction}
                />
                <span className="oph-checkable-text">{L('KAYTTOOIKEUSRYHMAT_LISAA_RYHMA')}</span>
            </label>

            <div className="flex-horizontal">
                <div className="flex-item-1 ">
                    <OrganisaatioSelectModal onSelect={props.organisaatioSelectAction} />
                    <ItemList
                        items={props.organisaatioSelections}
                        getItemName={(o) => o.name}
                        removeAction={props.removeOrganisaatioSelectAction}
                    />
                </div>
                <div className="flex-item-1 oppilaitostyyppi-wrapper">
                    <fieldset className="oph-fieldset">
                        <legend className="oph-label">{L('KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_OPPILAITOSTYYPPI')}</legend>
                        {oppilaitostyypitOptions.map((option, idx) => (
                            <label key={'oppilaitostyypit' + idx} htmlFor={'oppilaitostyypit' + idx}>
                                <input
                                    id={'oppilaitostyypit' + idx}
                                    type="checkbox"
                                    value={option.value}
                                    checked={
                                        props.oppilaitostyypitSelections &&
                                        props.oppilaitostyypitSelections.indexOf(option.value) !== -1
                                    }
                                    className="oph-checkbox-button-input"
                                    onClick={props.oppilaitostyypitSelectAction}
                                    onChange={() => ({})}
                                />
                                <span className="oph-checkbox-button-text">{option.label}</span>
                            </label>
                        ))}
                    </fieldset>
                </div>
                <div className="flex-item-1 organisaatiotyyppi-wrapper">
                    <fieldset className="oph-fieldset">
                        <legend className="oph-label">
                            {L('KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_ORGANISAATIOTYYPPI')}
                        </legend>
                        {organisaatiotyypitOptions.map((option, idx) => (
                            <label key={'organisaatiotyypit' + idx} htmlFor={'organisaatiotyypit' + idx}>
                                <input
                                    id={'organisaatiotyypit' + idx}
                                    type="checkbox"
                                    value={option.value}
                                    checked={
                                        props.organisaatiotyypitSelections &&
                                        props.organisaatiotyypitSelections.indexOf(option.value) !== -1
                                    }
                                    className="oph-checkbox-button-input"
                                    onClick={props.organisaatiotyypitSelectAction}
                                    onChange={() => ({})}
                                />
                                <span className="oph-checkbox-button-text">{option.label}</span>
                            </label>
                        ))}
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default KayttooikeusryhmanOrganisaatiorajoite;
