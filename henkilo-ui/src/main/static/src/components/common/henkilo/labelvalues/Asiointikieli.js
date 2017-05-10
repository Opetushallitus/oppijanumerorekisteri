import React from 'react'
import LabelValue from "./LabelValue";

const Asiointikieli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_ASIOINTIKIELI',
    data: props.koodisto.kieli
        .filter(koodi => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
        .map(koodi => ({value: koodi.value, label: koodi[props.locale]})),
    inputValue: 'asiointiKieli.kieliKoodi',
    value: props.henkilo.henkilo.asiointiKieli && props.koodisto.kieli
        .filter(kieli => kieli.value === props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][props.locale],
    selectValue: props.henkilo.henkilo.asiointiKieli && props.henkilo.henkilo.asiointiKieli.kieliKoodi,
}} />;

Asiointikieli.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        asiointikieli: React.PropTypes.object,
    })}),
    koodisto: React.PropTypes.shape({
        kieli: React.PropTypes.array,
    }),
    locale: React.PropTypes.string,
};

export default Asiointikieli;
