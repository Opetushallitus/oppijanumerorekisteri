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

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelFieldAction: () => void;
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

    return (
        <FieldlessLabelValue readOnly={props.readOnly} label="HENKILO_SUKUPUOLI">
            {props.readOnly ? (
                options.find((o) => o.value === props.henkiloUpdate.sukupuoli)?.label
            ) : (
                <Select
                    options={options}
                    value={options.find((o) => o.value === props.henkiloUpdate.sukupuoli)}
                    onChange={props.updateModelFieldAction}
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
