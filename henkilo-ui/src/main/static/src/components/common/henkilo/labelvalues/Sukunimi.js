// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    autofocus?: boolean,
    updateModelFieldAction?: () => void,
    label?: string
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

Sukunimi.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        sukunimi: PropTypes.string,
        hetu: PropTypes.string,
        yksiloityVTJ: PropTypes.bool,
    })}),
    readOnly: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Sukunimi);
