import React, { useMemo } from 'react';
import Select, { createFilter } from 'react-select';

import { useLocalisations, useOmatOrganisaatiot } from '../../../selectors';
import { getOrganisaatioOptions } from '../../../utilities/organisaatio.util';
import { FastMenuList, SelectOption } from '../../../utilities/select';

type OwnProps = {
    selectOrganisaatio: (o: SelectOption) => void;
    selectedOrganisaatioOid: string;
    placeholder?: string;
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
                className="organisaatioSelection"
                options={options}
                components={{ MenuList: FastMenuList }}
                filterOption={createFilter({ ignoreAccents: false })}
                placeholder={placeholder}
                onChange={props.selectOrganisaatio}
                value={options.find((o) => o.value === props.selectedOrganisaatioOid)}
            />
        )
    );
};

export default RyhmaSelection;
