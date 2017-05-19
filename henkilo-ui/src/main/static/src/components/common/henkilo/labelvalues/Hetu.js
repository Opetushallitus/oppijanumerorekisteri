import React from 'react'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Hetu = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_HETU',
    value: props.henkilo.henkilo.hetu,
    inputValue: 'hetu',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Hetu.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        hetu: React.PropTypes.string,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
};

export default Hetu;
