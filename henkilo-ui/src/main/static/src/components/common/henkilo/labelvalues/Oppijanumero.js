import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue";

const Oppijanumero = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_OPPIJANUMERO',
    value: props.henkilo.henkilo.oidHenkilo,
    inputValue: 'oidHenkilo',
    readOnly: true,
}} />;

Oppijanumero.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        oidHenkilo: PropTypes.string,
    })}),
};

export default Oppijanumero;