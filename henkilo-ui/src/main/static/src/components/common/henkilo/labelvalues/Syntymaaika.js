import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import LabelValue from "./LabelValue"

const Syntymaaika = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SYNTYMAAIKA',
    inputValue: 'syntymaaika',
    date: true,
    value: props.henkilo.henkilo.syntymaaika ? moment(new Date(props.henkilo.henkilo.syntymaaika)).format() : '',
    disabled: !!props.henkilo.henkilo.hetu,
}} />;

Syntymaaika.propTypes = {
    L: PropTypes.object,
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        syntymaaika: PropTypes.string,
        hetu: PropTypes.string,
    })}),
};

export default Syntymaaika;
