import React from 'react'
import LabelValue from "./LabelValue";

const Sukunimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SUKUNIMI',
    value: props.henkilo.henkilo.sukunimi,
    inputValue: 'sukunimi',
    autoFocus: true,
    disabled: !!props.henkilo.henkilo.hetu && props.henkilo.henkilo.yksiloityVTJ
}} />;

Sukunimi.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        sukunimi: React.PropTypes.string,
        hetu: React.PropTypes.string,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
};

export default Sukunimi;