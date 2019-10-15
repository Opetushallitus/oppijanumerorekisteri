// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import StaticUtils from "../../StaticUtils";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type OwnProps = {
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

type Props = {
    ...OwnProps,
    henkilo: HenkiloState,
}

const Hetu = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_HETU',
        value: props.henkilo.henkilo.hetu,
        inputValue: 'hetu',
        disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {})(Hetu);
