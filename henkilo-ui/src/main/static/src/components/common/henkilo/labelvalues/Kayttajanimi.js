import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue";
import R from 'ramda';

const Kayttajanimi = (props) => R.path(['henkilo', 'kayttajatieto', 'username'], props) ? <LabelValue {...props} values={{
    label: 'HENKILO_KAYTTAJANIMI',
    value: props.henkilo.kayttajatieto.username,
    inputValue: 'kayttajanimi',
    disabled: props.disabled,
    isError: props.isError,
}} /> : null;

Kayttajanimi.propTypes = {
    henkilo: PropTypes.shape({
        kayttajatieto: PropTypes.shape({
            username: PropTypes.string,
        }).isRequired,
    }).isRequired,
    disabled: PropTypes.bool.isRequired,
    isError: PropTypes.bool,
};

export default Kayttajanimi;
