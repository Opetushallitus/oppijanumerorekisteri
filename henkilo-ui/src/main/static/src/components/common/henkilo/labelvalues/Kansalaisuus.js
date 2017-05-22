import React from 'react'
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils";

const Kansalaisuus = (props) => <LabelValue {...props} values={
    props.henkilo.henkilo.kansalaisuus && props.henkilo.henkilo.kansalaisuus.length
        ? props.henkilo.henkilo.kansalaisuus.map((values, idx) =>
        ({
            label: 'HENKILO_KANSALAISUUS',
            data: props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[props.locale],
                optionsName: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',})),
            value: props.koodisto.kansalaisuus
                .filter(kansalaisuus => kansalaisuus.value === values.kansalaisuusKoodi)[0][props.locale],
            selectValue: props.henkiloUpdate.kansalaisuus[idx].kansalaisuusKoodi,
            disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
        })).reduce((a,b) => a.concat(b))
        : {
        label: 'HENKILO_KANSALAISUUS',
        data: props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[props.locale],
            optionsName: 'kansalaisuus.0.kansalaisuusKoodi'})),
        value: null,
        disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
    }
} />;

Kansalaisuus.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        kansalaisuus: React.PropTypes.array,
        yksiloityVTJ: React.PropTypes.bool,
    })}),
    koodisto: React.PropTypes.shape({
        kansalaisuus: React.PropTypes.array,
    }),
    locale: React.PropTypes.string,
    henkiloUpdate: React.PropTypes.shape({
        kansalaisuus: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                kansalalaisuusKoodi: React.PropTypes.string,
            })
        )
    }),
};

export default Kansalaisuus;
