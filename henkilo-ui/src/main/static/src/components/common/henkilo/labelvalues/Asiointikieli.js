import React from 'react'
import LabelValue from "./LabelValue";

const Asiointikieli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_ASIOINTIKIELI',
    data: props.koodisto.kieli
        .filter(koodi => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
        .map(koodi => ({value: koodi.value, label: koodi[props.locale], optionsName: 'asiointiKieli.kieliKoodi',})),
    value: props.henkilo.henkilo.asiointiKieli && props.koodisto.kieli
        .filter(kieli => kieli.value === props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][props.locale],
    selectValue: props.henkiloUpdate.asiointiKieli && props.henkiloUpdate.asiointiKieli.kieliKoodi,
}} />;

Asiointikieli.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        asiointikieli: React.PropTypes.object,
    })}),
    koodisto: React.PropTypes.shape({
        kieli: React.PropTypes.array,
    }),
    locale: React.PropTypes.string,
    henkiloUpdate: React.PropTypes.shape({
        asiointiKieli: React.PropTypes.shape({
            kieliKoodi: React.PropTypes.string,
        }),
    }),
};

export default Asiointikieli;
