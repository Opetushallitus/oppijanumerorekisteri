import React from 'react'
import LabelValue from "./LabelValue";

const Oppijanumero = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_OPPIJANUMERO',
    value: props.henkilo.henkilo.oidHenkilo,
    inputValue: 'oidHenkilo',
    readOnly: true,
}} />;

Oppijanumero.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        oidHenkilo: React.PropTypes.string,
    })}),
};

export default Oppijanumero;