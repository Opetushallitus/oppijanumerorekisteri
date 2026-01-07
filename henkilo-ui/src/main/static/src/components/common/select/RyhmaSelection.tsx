import React, { useMemo } from 'react';
import Select, { SingleValue } from 'react-select';

import { useLocalisations, useOmatOrganisaatiot } from '../../../selectors';
import { SelectOption, selectProps } from '../../../utilities/select';
import PropertySingleton from '../../../globals/PropertySingleton';

type OwnProps = {
    selectOrganisaatio: (o: SingleValue<SelectOption>) => void;
    selectedOrganisaatioOid?: string;
    placeholder?: string;
    disabled?: boolean;
};

const RyhmaSelection = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const organisaatiot = useOmatOrganisaatiot();
    const options = useMemo(() => {
        const ophOrg = organisaatiot?.find((o) => o.organisaatio.oid === PropertySingleton.state.rootOrganisaatioOid);
        if (!ophOrg) {
            return undefined;
        }
        const newOptions = ophOrg?.organisaatio.children
            .filter((o) => o.tyypit.indexOf('Ryhma') !== -1)
            .map((o) => ({ value: o.oid, label: o.nimi?.[locale] ?? '' }));
        newOptions.sort((a, b) => a.label.localeCompare(b.label));
        return newOptions;
    }, [organisaatiot]);
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
