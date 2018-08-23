// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {ReactSelectOption} from "../../../../types/react-select.types";
import type {Locale} from "../../../../types/locale.type";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        sukupuoli: Array<ReactSelectOption>,
    },
    locale: Locale,
    henkiloUpdate: Henkilo,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Sukupuoli = (props: Props) => <LabelValue
    readOnly={!!props.henkilo.henkilo.yksiloityVTJ || props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_SUKUPUOLI',
        data: props.koodisto.sukupuoli.map(koodi => ({value: koodi.value, label: koodi[props.locale],
            optionsName: 'sukupuoli',})),
        selectValue: props.henkiloUpdate.sukupuoli,
        disabled: !!props.henkilo.henkilo.yksiloityVTJ,
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect(mapStateToProps, {})(Sukupuoli);
