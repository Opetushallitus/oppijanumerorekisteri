import React, { Children, useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';
import Select, { components, MenuListProps, OptionProps, SingleValue, SingleValueProps } from 'react-select';
import { skipToken } from '@reduxjs/toolkit/query';

import type { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { useLocalisations, useOmatOrganisaatiot } from '../../selectors';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../utilities/organisaatio.util';
import {
    useGetHenkiloHakuOrganisaatiotQuery,
    useGetOmattiedotQuery,
    useGetOrganisationNamesQuery,
} from '../../api/kayttooikeus';
import { selectStyles } from '../../utilities/select';
import { containsSearchword, filterAndSortOrganisaatios } from '../common/select/OrganisaatioSelectModal';

type OwnProps = {
    defaultValue?: string;
    onChange: (organisaatio: SingleValue<OrganisaatioSelectObject>) => void;
    disabled?: boolean;
    type?: 'HENKILOHAKU';
    placeholder?: string;
    label?: string;
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

export const OphDsOrganisaatioSelect = ({ defaultValue, disabled, label, onChange, type, placeholder }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: organisationNames } = useGetOrganisationNamesQuery();
    const omattiedotOrganisations = useOmatOrganisaatiot();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: henkilohakuOrganisaatiot } = useGetHenkiloHakuOrganisaatiotQuery(
        omattiedot && type === 'HENKILOHAKU' ? omattiedot.oidHenkilo : skipToken
    );
    const [searchWord, setSearchWord] = useState<string>('');

    const allOrganisations = useMemo(() => {
        if (organisationNames) {
            const organisations = type === 'HENKILOHAKU' ? henkilohakuOrganisaatiot : omattiedotOrganisations;
            const options = omattiedotOrganisaatiotToOrganisaatioSelectObject(
                organisations ?? [],
                organisationNames,
                locale
            );
            const filtered = filterAndSortOrganisaatios(options, searchWord);
            return filtered;
        } else {
            return [];
        }
    }, [omattiedotOrganisations, henkilohakuOrganisaatiot, organisationNames, locale, searchWord, type]);

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
                    {o.data.status === 'SUUNNITELTU' && <div>{L('ORGANISAATIONVALINTA_SUUNNITELTU')}</div>}
                    {o.data.status === 'PASSIIVINEN' && <div>{L('ORGANISAATIONVALINTA_PASSIIVINEN')}</div>}
                </div>
            </div>
        </components.Option>
    );

    const OrganisationSingleValue = (props: SingleValueProps<OrganisaatioSelectObject>) => (
        <components.SingleValue {...props}>{props.data.name}</components.SingleValue>
    );

    return (
        <div>
            {label && (
                <label htmlFor="organisaatio-select" className="oph-ds-label">
                    {label}
                </label>
            )}
            <Select
                {...selectStyles}
                defaultValue={allOrganisations.find((o) => o.oid === defaultValue)}
                inputId="organisaatio-select"
                className="oph-ds-select-org"
                isDisabled={disabled}
                options={allOrganisations}
                onInputChange={setSearchWord}
                filterOption={(o, input) => containsSearchword(input.toLowerCase())(o.data)}
                placeholder={placeholder ?? L('VALITSE_ORGANISAATIO')}
                onChange={onChange}
                components={{
                    MenuList: OrganisationMenuList,
                    Option: OrganisationOption,
                    SingleValue: OrganisationSingleValue,
                }}
                noOptionsMessage={() => L('HENKILOHAKU_EI_TULOKSIA')}
                isClearable
            />
        </div>
    );
};
