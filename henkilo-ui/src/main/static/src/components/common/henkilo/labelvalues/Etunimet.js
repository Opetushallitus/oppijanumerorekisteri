import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue";
import StaticUtils from "../../StaticUtils";

const Etunimet = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_ETUNIMET',
    value: props.henkilo.henkilo.etunimet,
    inputValue: 'etunimet',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Etunimet.propTypes = {
    henkilo: PropTypes.shape({
        henkilo: PropTypes.shape({
            etunimet: PropTypes.string.isRequired,
            hetu: PropTypes.string,
            yksiloityVTJ: PropTypes.bool,
        }).isRequired,
    }).isRequired,
};

export default Etunimet;
