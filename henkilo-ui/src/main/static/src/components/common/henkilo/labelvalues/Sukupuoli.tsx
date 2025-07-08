import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import type { RootState } from '../../../../store';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Locale } from '../../../../types/locale.type';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { fetchSukupuoliKoodisto } from '../../../../actions/koodisto.actions';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (o: NamedSelectOption | NamedMultiSelectOption) => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    locale: Locale;
};

type DispatchProps = {
    fetchSukupuoliKoodisto: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const Sukupuoli = (props: Props) => {
    const options = useMemo(() => {
        return props.koodisto.sukupuoli.map((koodi) => ({
            value: koodi.value,
            label: koodi[props.locale],
            optionsName: 'sukupuoli',
        }));
    }, [props.koodisto]);

    useEffect(() => {
        props.fetchSukupuoliKoodisto();
    }, []);

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

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchSukupuoliKoodisto,
})(Sukupuoli);
