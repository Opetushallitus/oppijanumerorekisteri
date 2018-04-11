// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Oppijanumero = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_OPPIJANUMERO',
        value: props.henkilo.henkilo.oidHenkilo,
        inputValue: 'oidHenkilo',
        readOnly: true,
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Oppijanumero);
