import React from 'react'
import LabelValue from "./LabelValue"

const Kansalaisuus = (props) => <LabelValue {...props} values={
    props.henkilo.henkilo.kansalaisuus && props.henkilo.henkilo.kansalaisuus.length
    ? props.henkilo.henkilo.kansalaisuus.map((values, idx) =>
        ({
            label: 'HENKILO_KANSALAISUUS',
            data: props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[props.locale]})),
            value: props.koodisto.kansalaisuus
                .filter(kansalaisuus => kansalaisuus.value === values.kansalaisuusKoodi)[0][props.locale],
            inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
            selectValue: values.kansalaisuusKoodi
        })).reduce((a,b) => a.concat(b))
    : { label: 'HENKILO_KANSALAISUUS',
        data: props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[props.locale]})),
        inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
        value: null, }
} />;

Kansalaisuus.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        kansalaisuus: React.PropTypes.array,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
    koodisto: React.PropTypes.shape({
        kansalaisuus: React.PropTypes.object,
    }),
    locale: React.PropTypes.string,
};

export default Kansalaisuus;
