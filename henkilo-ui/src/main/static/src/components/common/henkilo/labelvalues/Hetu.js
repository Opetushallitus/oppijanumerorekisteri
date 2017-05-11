import React from 'react'
import LabelValue from "./LabelValue"

const Hetu = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_HETU',
    value: props.henkilo.henkilo.hetu,
    inputValue: 'hetu',
    disabled: !!props.henkilo.henkilo.hetu && props.henkilo.henkilo.yksiloityVTJ
}} />;

Hetu.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        hetu: React.PropTypes.string,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
};

export default Hetu;
