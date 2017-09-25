import React from 'react'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue";

const Kutsumanimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_KUTSUMANIMI',
    value: props.henkilo.henkilo.kutsumanimi,
    inputValue: 'kutsumanimi',
    isError: props.isError,
}} />;

Kutsumanimi.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        kutsumanimi: PropTypes.string,
    })}),
};

export default Kutsumanimi;
