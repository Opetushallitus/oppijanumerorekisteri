import React from 'react'
import PropTypes from 'prop-types'
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
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        aidinkieli: PropTypes.object,
    })}),
    koodisto: PropTypes.shape({
        kieli: PropTypes.array,
    }),
    locale: PropTypes.string,
    henkiloUpdate: PropTypes.shape({
        aidinkieli: PropTypes.shape({
            kieliKoodi: PropTypes.string,
        }),
    }),
};

export default Aidinkieli;
