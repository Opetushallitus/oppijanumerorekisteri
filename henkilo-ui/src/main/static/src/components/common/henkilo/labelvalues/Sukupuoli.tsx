import React, { useMemo } from 'react';
import Select, { SingleValue } from 'react-select';

import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetSukupuoletQuery } from '../../../../api/koodisto';
import { localizeKoodiNimi } from '../../StaticUtils';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (o: SingleValue<NamedSelectOption> | NamedMultiSelectOption) => void;
};

const Sukupuoli = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const { data } = useGetSukupuoletQuery();
    const options = useMemo(() => {
        return (
            data?.map((koodi) => ({
                value: koodi.koodiArvo.toLowerCase(),
                label: localizeKoodiNimi(koodi, locale),
                optionsName: 'sukupuoli',
            })) ?? []
        );
    }, [data]);

    const label = 'HENKILO_SUKUPUOLI';

    return (
        <FieldlessLabelValue readOnly={props.readOnly} label={label}>
            {props.readOnly ? (
                <span data-testid={`${label}_value`}>
                    {options.find((o) => o.value === props.henkiloUpdate.sukupuoli)?.label}
                </span>
            ) : (
                <Select
                    options={options}
                    value={options.find((o) => o.value === props.henkiloUpdate.sukupuoli)}
                    onChange={props.updateModelSelectAction}
                    isDisabled={!!props.henkiloUpdate.hetu}
                />
            )}
        </FieldlessLabelValue>
    );
};

export default Sukupuoli;
