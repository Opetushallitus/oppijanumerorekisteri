import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue";

const Kayttajanimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_KAYTTAJANIMI',
    value: props.henkilo.kayttajatieto.username,
    inputValue: 'kayttajanimi',
    disabled: props.disabled,
}} />;

Kayttajanimi.propTypes = {
    henkilo: PropTypes.shape({kayttajanimi: PropTypes.shape({
        username: PropTypes.string,
    })}),
    disabled: PropTypes.bool.isRequired,
};

export default Kayttajanimi;
