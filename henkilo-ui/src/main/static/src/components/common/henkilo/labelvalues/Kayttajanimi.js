import React from 'react'
import LabelValue from "./LabelValue";

const Kayttajanimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_KAYTTAJANIMI',
    value: props.henkilo.kayttajatieto.username,
    inputValue: 'kayttajanimi',
    disabled: props.disabled,
}} />;

Kayttajanimi.propTypes = {
    henkilo: React.PropTypes.shape({kayttajanimi: React.PropTypes.shape({
        username: React.PropTypes.string,
    })}),
    disabled: React.PropTypes.bool.isRequired,
};

export default Kayttajanimi;
