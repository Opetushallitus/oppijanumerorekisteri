import React from 'react'
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";

const Etunimet = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_ETUNIMET',
    value: props.henkilo.henkilo.etunimet,
    inputValue: 'etunimet',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Etunimet.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        etunimet: React.PropTypes.string,
        hetu: React.PropTypes.string,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
};

export default Etunimet;