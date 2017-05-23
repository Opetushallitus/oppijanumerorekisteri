import React from 'react'
import dateformat from 'dateformat'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Syntymaaika = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SYNTYMAAIKA',
    inputValue: 'syntymaaika',
    date: true,
    value: dateformat(new Date(props.henkilo.henkilo.syntymaaika), props.L['PVM_FORMAATTI']),
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Syntymaaika.propTypes = {
    L: React.PropTypes.object,
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        syntymaaika: React.PropTypes.string.isRequired,
        hetu: React.PropTypes.string.isRequired,
        yksiloityVTJ: React.PropTypes.bool.isRequired,
    })}),
};

export default Syntymaaika;
