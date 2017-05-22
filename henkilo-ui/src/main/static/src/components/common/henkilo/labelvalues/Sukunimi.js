import React from 'react'
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";

const Sukunimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SUKUNIMI',
    value: props.henkilo.henkilo.sukunimi,
    inputValue: 'sukunimi',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Sukunimi.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        sukunimi: React.PropTypes.string,
        hetu: React.PropTypes.string,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
};

export default Sukunimi;