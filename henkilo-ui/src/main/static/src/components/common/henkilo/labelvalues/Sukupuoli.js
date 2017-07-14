import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Sukupuoli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SUKUPUOLI',
    value: props.henkilo.henkilo.sukupuoli,
    inputValue: 'sukupuoli',
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo)
}} />;

Sukupuoli.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        sukupuoli: PropTypes.string,
    })}),
};

export default Sukupuoli;
