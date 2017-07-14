import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Hetu = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_HETU',
    value: props.henkilo.henkilo.hetu,
    inputValue: 'hetu',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Hetu.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        hetu: PropTypes.string,
        yksiloityVTJ: PropTypes.bool,
    })}),
};

export default Hetu;
