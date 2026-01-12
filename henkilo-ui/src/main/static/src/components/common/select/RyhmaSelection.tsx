import React, { useMemo } from 'react';
import Select, { SingleValue } from 'react-select';

import { useLocalisations, useOmatRyhmat } from '../../../selectors';
import { SelectOption, selectProps } from '../../../utilities/select';

type OwnProps = {
    selectOrganisaatio: (o: SingleValue<SelectOption>) => void;
    selectedOrganisaatioOid?: string;
    placeholder?: string;
    disabled?: boolean;
};

const RyhmaSelection = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const omatRyhmat = useOmatRyhmat();
    const options = useMemo(() => {
        return omatRyhmat
            .map((_) => ({ value: _.oid, label: _.nimi?.[locale] ?? '' }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [omatRyhmat, locale]);
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
