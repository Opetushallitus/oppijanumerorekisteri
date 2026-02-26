import React, { useMemo } from 'react';
import Select, { SingleValue } from 'react-select';
import { skipToken } from '@reduxjs/toolkit/query';

import { useLocalisations, useOmatRyhmat } from '../../selectors';
import { SelectOption, selectProps } from '../../utilities/select';
import { useGetHenkiloHakuOrganisaatiotQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { OrganisaatioWithChildren } from '../../types/domain/organisaatio/organisaatio.types';

type OwnProps = {
    defaultValue?: string;
    selectOrganisaatio: (o: SingleValue<SelectOption>) => void;
    selectedOrganisaatioOid?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    type?: 'HENKILOHAKU';
};

export const OphDsRyhmaSelect = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const omatRyhmat = !props.type ? useOmatRyhmat() : [];
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: henkilohakuOrganisaatiot } = useGetHenkiloHakuOrganisaatiotQuery(
        omattiedot && props.type === 'HENKILOHAKU' ? omattiedot.oidHenkilo : skipToken
    );
    const options = useMemo(() => {
        const ryhmat =
            props.type === 'HENKILOHAKU'
                ? henkilohakuOrganisaatiot
                      ?.reduce<
                          OrganisaatioWithChildren[]
                      >((acc, o) => acc.concat([o.organisaatio], o.organisaatio.children), [])
                      .filter((o) => o.tyypit.some((t) => t === 'Ryhma'))
                : omatRyhmat;
        return (
            ryhmat
                ?.map((r) => ({ label: r.nimi[locale] ?? '', value: r.oid }))
                .sort((a, b) => a.label.localeCompare(b.label)) ?? []
        );
    }, [omatRyhmat, henkilohakuOrganisaatiot, locale, props.type]);

    return (
        <div>
            {props.label && (
                <label htmlFor="ryhma-select" className="oph-ds-label">
                    {props.label}
                </label>
            )}
            <Select
                {...selectProps}
                inputId="ryhma-select"
                defaultValue={options.find((o) => o.value === props.defaultValue)}
                className="oph-ds-ryhma-select"
                options={options}
                placeholder={props.placeholder ?? L('VALITSE_RYHMA')}
                onChange={props.selectOrganisaatio}
                value={options.find((o) => o.value === props.selectedOrganisaatioOid)}
                isDisabled={props.disabled}
                isClearable
            />
        </div>
    );
};
