import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue"

const Sukupuoli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SUKUPUOLI',
    value: props.henkilo.henkilo.sukupuoli,
    inputValue: 'sukupuoli',
    disabled: !!props.henkilo.henkilo.hetu,
}} />;

Sukupuoli.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        sukupuoli: PropTypes.string,
        hetu: PropTypes.string,
    })}),
};

export default Sukupuoli;
