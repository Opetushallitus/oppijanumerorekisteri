import React, { Children, useMemo, useState } from 'react';
import { compose, prop, sortBy, toLower } from 'ramda';
import { FixedSizeList } from 'react-window';
import Select, { components, MenuListProps, OptionProps, SingleValueProps } from 'react-select';

import type { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { useLocalisations, useOmatOrganisaatiot } from '../../selectors';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../utilities/organisaatio.util';
import { useGetOrganisationNamesQuery } from '../../api/kayttooikeus';
import { selectStyles } from '../../utilities/select';

type OwnProps = {
    onChange: (organisaatio: OrganisaatioSelectObject) => void;
    disabled?: boolean;
};

const OrganisationMenuList = (props: MenuListProps<OrganisaatioSelectObject, false>) => {
    const { children, maxHeight } = props;
    const childrenOptions = Children.toArray(children);
    return (
        <FixedSizeList itemSize={70} height={maxHeight} width="100%" itemCount={childrenOptions.length}>
            {({ index, style }) => (
                <div style={style} key={index} className="oph-ds-select-menu-item">
                    {childrenOptions[index]}
                </div>
            )}
        </FixedSizeList>
    );
};

export const OphDsOrganisaatioSelect = ({ disabled, onChange }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: organisationNames } = useGetOrganisationNamesQuery();
    const omattiedotOrganisations = useOmatOrganisaatiot();
    const [selection, setSelection] = useState<OrganisaatioSelectObject>();

    const allOrganisations = useMemo(() => {
        if (omattiedotOrganisations?.length && organisationNames) {
            const options = omattiedotOrganisaatiotToOrganisaatioSelectObject(
                omattiedotOrganisations,
                organisationNames,
                locale
            );
            return sortBy(compose(toLower, prop('name')), options);
        } else {
            return [];
        }
    }, [omattiedotOrganisations, organisationNames, locale]);

    const onSelect = (o: OrganisaatioSelectObject) => {
        setSelection(o);
        onChange(o);
    };

    const OrganisationOption = (o: OptionProps<OrganisaatioSelectObject>) => (
        <components.Option {...o}>
            <div className="oph-ds-select-org-option">
                <div>
                    <div className="oph-ds-select-org-parent">
                        {o.data.parentNames.join(' > ')}
                        {' >'}
                    </div>
                    <div className="oph-ds-select-org-name">
                        {o.data.name}{' '}
                        {o.data.organisaatiotyypit?.length > 0 && `(${o.data.organisaatiotyypit.toString()})`}
                    </div>
                </div>
                <div>
                    {o.data.status === 'SUUNNITELTU' && <div>{L['ORGANISAATIONVALINTA_SUUNNITELTU']}</div>}
                    {o.data.status === 'PASSIIVINEN' && <div>{L['ORGANISAATIONVALINTA_PASSIIVINEN']}</div>}
                </div>
            </div>
        </components.Option>
    );

    const OrganisationSingleValue = (props: SingleValueProps<OrganisaatioSelectObject>) => (
        <components.SingleValue {...props}>{props.data.name}</components.SingleValue>
    );

    return (
        <Select
            {...selectStyles}
            inputId="organisaatio-select"
            className="oph-ds-select-org"
            isDisabled={disabled || !omattiedotOrganisations?.length}
            options={allOrganisations}
            filterOption={(o, input) => {
                const iinput = input.toLowerCase();
                return (
                    o.data.name.toLowerCase().includes(iinput) ||
                    !!o.data.parentNames.find((p) => p.toLowerCase().includes(iinput))
                );
            }}
            placeholder={L['OMATTIEDOT_VALITSE_ORGANISAATIO']}
            onChange={onSelect}
            value={selection}
            components={{
                MenuList: OrganisationMenuList,
                Option: OrganisationOption,
                SingleValue: OrganisationSingleValue,
            }}
            noOptionsMessage={() => L['HENKILOHAKU_EI_TULOKSIA']}
            isClearable
        />
    );
};
