import React from 'react'
import LabelValue from "./LabelValue"

const Sukupuoli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SUKUPUOLI',
    value: props.henkilo.henkilo.sukupuoli,
    inputValue: 'sukupuoli',
}} />;

Sukupuoli.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        sukupuoli: React.PropTypes.string,
    })}),
};

export default Sukupuoli;
