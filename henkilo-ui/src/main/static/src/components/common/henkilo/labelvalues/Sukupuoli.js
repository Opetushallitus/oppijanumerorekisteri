// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Sukupuoli = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_SUKUPUOLI',
        value: props.henkilo.henkilo.sukupuoli,
        inputValue: 'sukupuoli',
        disabled: !!props.henkilo.henkilo.hetu,
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Sukupuoli);
