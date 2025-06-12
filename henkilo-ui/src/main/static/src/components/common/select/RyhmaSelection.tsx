import React, { useMemo } from 'react';
import Select from 'react-select';

import { useLocalisations, useOmatOrganisaatiot } from '../../../selectors';
import { getOrganisaatioOptions } from '../../../utilities/organisaatio.util';
import { SelectOption, selectProps } from '../../../utilities/select';

type OwnProps = {
    selectOrganisaatio: (o: SelectOption) => void;
    selectedOrganisaatioOid: string;
    placeholder?: string;
    disabled?: boolean;
};

const RyhmaSelection = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const organisaatiot = useOmatOrganisaatiot();
    const options = useMemo(
        () => organisaatiot && getOrganisaatioOptions(organisaatiot, locale, true),
        [organisaatiot]
    );
    const placeholder = props.placeholder ? props.placeholder : L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA'];

    return (
        !!options && (
            <Select
                {...selectProps}
                className="organisaatioSelection"
                options={options}
                placeholder={placeholder}
                onChange={props.selectOrganisaatio}
                value={options.find((o) => o.value === props.selectedOrganisaatioOid)}
                isDisabled={props.disabled}
                isClearable
            />
        )
    );
};

export default RyhmaSelection;
