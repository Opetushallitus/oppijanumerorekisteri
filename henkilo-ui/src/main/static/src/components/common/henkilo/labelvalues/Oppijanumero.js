// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type OwnProps = {
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

type Props = {
    ...OwnProps,
    henkilo: HenkiloState,
}

const Oppijanumero = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_OPPIJANUMERO',
        value: props.henkilo.master.oppijanumero,
        inputValue: 'oppijanumero',
        readOnly: true,
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {})(Oppijanumero);
