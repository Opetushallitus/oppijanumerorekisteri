import React, { useMemo } from 'react';
import type { OnChangeHandler, Option } from 'react-select';

import OphSelect from './OphSelect';
import { useLocalisations, useOmatOrganisaatiot } from '../../../selectors';
import { getOrganisaatioOptionsAndFilter } from '../../../utilities/organisaatio.util';

type OwnProps = {
    selectOrganisaatio: OnChangeHandler<string, Option<string>>;
    selectedOrganisaatioOid: string;
    placeholder?: string;
    clearable?: boolean;
};

const RyhmaSelection = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const organisaatiot = useOmatOrganisaatiot();
    const options = useMemo(
        () => organisaatiot && getOrganisaatioOptionsAndFilter(organisaatiot, locale, true),
        [organisaatiot]
    );
    const placeholder = props.placeholder ? props.placeholder : L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA'];

    return (
        !!options && (
            <OphSelect
                className={'organisaatioSelection'}
                options={options.options}
                filterOptions={options.filterOptions}
                placeholder={placeholder}
                onChange={props.selectOrganisaatio}
                value={props.selectedOrganisaatioOid}
                clearable={props.clearable}
                noResultsText={L['EI_TULOKSIA']}
                optionHeight={45}
                maxHeight={400}
            />
        )
    );
};

export default RyhmaSelection;
