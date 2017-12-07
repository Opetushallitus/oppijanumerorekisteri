// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";

const Sukunimi = (props) => <LabelValue {...props} values={{
    label: props.label || 'HENKILO_SUKUNIMI',
    value: props.henkilo.henkilo.sukunimi,
    inputValue: 'sukunimi',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

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
