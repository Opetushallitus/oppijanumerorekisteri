import React from 'react'
import LabelValue from "./LabelValue";

const Kutsumanimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_KUTSUMANIMI',
    value: props.henkilo.henkilo.kutsumanimi,
    inputValue: 'kutsumanimi'}} />;

Kutsumanimi.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        kutsumanimi: React.PropTypes.string,
    })}),
};

export default Kutsumanimi;
