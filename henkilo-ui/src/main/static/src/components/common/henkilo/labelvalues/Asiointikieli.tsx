import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import type { RootState } from '../../../../store';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Locale } from '../../../../types/locale.type';
import { NamedSelectOption } from '../../../../utilities/select';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';
import { FieldlessLabelValue } from './FieldlessLabelValue';

type OwnProps = {
    henkiloUpdate: { asiointiKieli?: { kieliKoodi?: string } };
    readOnly?: boolean;
    updateModelSelectAction: (arg0: NamedSelectOption) => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    locale: Locale;
};

type Props = OwnProps & StateProps;

const Asiointikieli = (props: Props) => {
    const options = useMemo(() => {
        return props.koodisto.kieli
            .filter((koodi) => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
            .map((koodi) => ({
                value: koodi.value,
                label: koodi[props.locale],
                optionsName: 'asiointiKieli.kieliKoodi',
            }));
    }, [props.koodisto.kieli]);

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

const mapStateToProps = (state: RootState): StateProps => ({
    locale: state.locale,
    koodisto: state.koodisto,
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Asiointikieli);
