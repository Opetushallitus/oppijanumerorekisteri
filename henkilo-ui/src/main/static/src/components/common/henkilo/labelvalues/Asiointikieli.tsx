import React, { useMemo } from 'react';
import Select from 'react-select';

import { NamedSelectOption } from '../../../../utilities/select';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { useLocalisations } from '../../../../selectors';
import { useGetKieletQuery } from '../../../../api/koodisto';
import StaticUtils from '../../StaticUtils';

type OwnProps = {
    henkiloUpdate: { asiointiKieli?: { kieliKoodi?: string } };
    readOnly?: boolean;
    updateModelSelectAction: (arg0: NamedSelectOption) => void;
};

const Asiointikieli = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const { data } = useGetKieletQuery();
    const options = useMemo(() => {
        return (
            data?.map((koodi) => ({
                value: koodi.koodiArvo.toLowerCase(),
                label: StaticUtils.localizeKoodiNimi(koodi, locale),
                optionsName: 'asiointiKieli.kieliKoodi',
            })) ?? []
        );
    }, [data]);

    return (
        <FieldlessLabelValue readOnly={props.readOnly} label="HENKILO_ASIOINTIKIELI">
            {props.readOnly ? (
                options.find((o) => o.value === props.henkiloUpdate.asiointiKieli?.kieliKoodi)?.label
            ) : (
                <Select
                    options={options}
                    value={options.find((o) => o.value === props.henkiloUpdate.asiointiKieli?.kieliKoodi)}
                    onChange={props.updateModelSelectAction}
                />
            )}
        </FieldlessLabelValue>
    );
};

export default Asiointikieli;
