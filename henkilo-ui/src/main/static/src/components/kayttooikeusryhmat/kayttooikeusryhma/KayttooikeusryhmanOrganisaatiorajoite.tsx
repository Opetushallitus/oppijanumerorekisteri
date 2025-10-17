import React, { useMemo } from 'react';

import ItemList from './ItemList';
import './KayttooikeusryhmanOrganisaatiorajoite.css';
import OrganisaatioSelectModal from '../../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import OphCheckboxFieldset from '../../common/forms/OphCheckboxFieldset';
import { useLocalisations } from '../../../selectors';
import { koodiLabel, useGetOppilaitostyypitQuery, useGetOrganisaatiotyypitQuery } from '../../../api/koodisto';

type Props = {
    ryhmaRestriction: boolean;
    toggleRyhmaRestriction: () => void;
    organisaatioSelections: Array<OrganisaatioSelectObject>;
    organisaatioSelectAction: (organisaatio: OrganisaatioSelectObject) => void;
    removeOrganisaatioSelectAction: (selection: OrganisaatioSelectObject) => void;
    oppilaitostyypitSelections: Array<string>;
    oppilaitostyypitSelectAction: (selection: React.ChangeEvent<HTMLInputElement>) => void;
    organisaatiotyypitSelections: Array<string>;
    organisaatiotyypitSelectAction: (selection: React.ChangeEvent<HTMLInputElement>) => void;
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
            <h4>{L['KAYTTOOIKEUSRYHMAT_LISAA_ORGANISAATIORAJOITE_OTSIKKO']}</h4>
            <label className="oph-checkable" htmlFor="ryhmarestriction">
                <input
                    id="ryhmarestriction"
                    className="oph-checkable-input"
                    type="checkbox"
                    onChange={props.toggleRyhmaRestriction}
                    checked={props.ryhmaRestriction}
                />
                <span className="oph-checkable-text">{L['KAYTTOOIKEUSRYHMAT_LISAA_RYHMA']}</span>
            </label>

            <div className="flex-horizontal">
                <div className="flex-item-1 ">
                    <OrganisaatioSelectModal onSelect={props.organisaatioSelectAction} />
                    <ItemList
                        items={props.organisaatioSelections}
                        labelPath={['name']}
                        removeAction={props.removeOrganisaatioSelectAction}
                    />
                </div>
                <div className="flex-item-1 oppilaitostyyppi-wrapper">
                    <OphCheckboxFieldset
                        legendText={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_OPPILAITOSTYYPPI']!}
                        options={oppilaitostyypitOptions.map((option) => ({
                            label: option.label,
                            value: option.value,
                            checked:
                                props.oppilaitostyypitSelections &&
                                props.oppilaitostyypitSelections.indexOf(option.value) !== -1,
                        }))}
                        selectAction={props.oppilaitostyypitSelectAction}
                    />
                </div>
                <div className="flex-item-1 organisaatiotyyppi-wrapper">
                    <OphCheckboxFieldset
                        legendText={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_ORGANISAATIOTYYPPI']!}
                        options={organisaatiotyypitOptions.map((option) => ({
                            label: option.label,
                            value: option.value,
                            checked:
                                props.organisaatiotyypitSelections &&
                                props.organisaatiotyypitSelections.indexOf(option.value) !== -1,
                        }))}
                        selectAction={props.organisaatiotyypitSelectAction}
                    />
                </div>
            </div>
        </div>
    );
};

export default KayttooikeusryhmanOrganisaatiorajoite;
