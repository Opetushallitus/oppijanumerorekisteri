import React from 'react'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Aidinkieli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_AIDINKIELI',
    data: props.koodisto.kieli.map(koodi => ({value: koodi.value, label: koodi[props.locale],
        optionsName: 'aidinkieli.kieliKoodi',})),
    value: props.henkilo.henkilo.aidinkieli && props.koodisto.kieli.filter(kieli =>
    kieli.value === props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][props.locale],
    selectValue: props.henkiloUpdate.aidinkieli && props.henkiloUpdate.aidinkieli.kieliKoodi,
    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
}} />;

Aidinkieli.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        aidinkieli: React.PropTypes.object,
    })}),
    koodisto: React.PropTypes.shape({
        kieli: React.PropTypes.array,
    }),
    locale: React.PropTypes.string,
    henkiloUpdate: React.PropTypes.shape({
        aidinkieli: React.PropTypes.shape({
            kieliKoodi: React.PropTypes.string,
        }),
    }),
};

export default Aidinkieli;
