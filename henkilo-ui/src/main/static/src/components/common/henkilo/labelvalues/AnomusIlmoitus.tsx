import React, { useMemo } from 'react';
import Select from 'react-select';

import { localizeTextGroup } from '../../../../utilities/localisation.util';
import { NamedMultiSelectOption } from '../../../../utilities/select';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { useLocalisations } from '../../../../selectors';
import { useGetKayttooikeusryhmaByKayttooikeusQuery, useGetOmattiedotQuery } from '../../../../api/kayttooikeus';

type OwnProps = {
    updateModelSelectAction: (arg0: NamedMultiSelectOption) => void;
    readOnly?: boolean;
    henkiloUpdate: Henkilo;
};

const renderOptions = (options: { value: number; label: string }[], anomusilmoitus: number[]) => {
    return (
        <ul>
            {options
                ?.filter((o) => !!anomusilmoitus.find((a) => a === o.value))
                .map((o) => (
                    <li key={o.value}>{o.label}</li>
                ))}
        </ul>
    );
};

export const AnomusIlmoitus = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: vastuukayttajaRyhmat } = useGetKayttooikeusryhmaByKayttooikeusQuery('VASTUUKAYTTAJAT');

    const options = useMemo(() => {
        return (
            vastuukayttajaRyhmat?.map((vastuukayttajaRyhma) => ({
                value: vastuukayttajaRyhma.id,
                label: localizeTextGroup(vastuukayttajaRyhma.nimi?.texts, locale),
                optionsName: 'anomusilmoitus',
            })) ?? []
        );
    }, [vastuukayttajaRyhmat]);

    return (
        <FieldlessLabelValue label="HENKILO_ANOMUSILMOITUKSET">
            {props.readOnly ? (
                renderOptions(options, omattiedot?.anomusilmoitus)
            ) : (
                <Select
                    options={options}
                    isMulti={true}
                    isDisabled={props.readOnly}
                    value={options.filter((o) => !!props.henkiloUpdate.anomusilmoitus.find((a) => a === o.value))}
                    onChange={(tilaukset) => {
                        return (
                            tilaukset &&
                            props.updateModelSelectAction({
                                optionsName: 'anomusilmoitus',
                                value: [...tilaukset.map((tilaus) => tilaus.value)],
                            })
                        );
                    }}
                />
            )}
        </FieldlessLabelValue>
    );
};
