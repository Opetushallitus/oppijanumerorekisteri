// @flow
import React from 'react'
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    updateModelFieldAction?: () => void,
}

const Etunimet = (props: Props) => <LabelValue
    updateModelFieldAction={props.updateModelFieldAction}
    readOnly={props.readOnly}
    values={{
        label: 'HENKILO_ETUNIMET',
        value: props.henkilo.henkilo.etunimet,
        inputValue: 'etunimet',
        disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Etunimet);
