// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type OwnProps = {
    readOnly: boolean,
    autofocus?: boolean,
    updateModelFieldAction?: () => void,
    label?: string
}

type Props = {
    ...OwnProps,
    henkilo: HenkiloState,
}

const Sukunimi = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    autofocus={props.autofocus}
    values={{
        label: props.label || 'HENKILO_SUKUNIMI',
        value: props.henkilo.henkilo.sukunimi,
        inputValue: 'sukunimi',
        disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
    }}
/>;

const mapStateToProps = (state) => ({
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {})(Sukunimi);
