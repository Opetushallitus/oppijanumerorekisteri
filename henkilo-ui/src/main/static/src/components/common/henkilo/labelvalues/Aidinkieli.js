import React from 'react'
import LabelValue from "./LabelValue"

const Aidinkieli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_AIDINKIELI',
    data: props.koodisto.kieli.map(koodi => ({value: koodi.value, label: koodi[props.locale]})),
    inputValue: 'aidinkieli.kieliKoodi',
    value: props.henkilo.henkilo.aidinkieli && props.koodisto.kieli.filter(kieli =>
    kieli.value === props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][props.locale],
    selectValue: props.henkilo.henkilo.aidinkieli && props.henkilo.henkilo.aidinkieli.kieliKoodi}
} />;

Aidinkieli.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        aidinkieli: React.PropTypes.object,
    })}),
    koodisto: React.PropTypes.shape({
        kieli: React.PropTypes.object,
    }),
    locale: React.PropTypes.string,
};

export default Aidinkieli;
