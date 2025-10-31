import React from 'react';
import Select, { SingleValue } from 'react-select';

import { NamedSelectOption } from '../../../../utilities/select';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { useAsiointikielet, useLocalisations } from '../../../../selectors';

type OwnProps = {
    henkiloUpdate: { asiointiKieli?: { kieliKoodi?: string } };
    readOnly?: boolean;
    updateModelSelectAction: (arg0: SingleValue<NamedSelectOption>) => void;
};

const Asiointikieli = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const options = useAsiointikielet(locale);

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
