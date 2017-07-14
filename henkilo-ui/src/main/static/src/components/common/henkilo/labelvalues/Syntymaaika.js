import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Syntymaaika = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SYNTYMAAIKA',
    inputValue: 'syntymaaika',
    date: true,
    value: props.henkilo.henkilo.syntymaaika ? moment(new Date(props.henkilo.henkilo.syntymaaika)).format() : '',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Syntymaaika.propTypes = {
    L: PropTypes.object,
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        syntymaaika: PropTypes.string,
        hetu: PropTypes.string.isRequired,
        yksiloityVTJ: PropTypes.bool.isRequired,
    })}),
};

export default Syntymaaika;
