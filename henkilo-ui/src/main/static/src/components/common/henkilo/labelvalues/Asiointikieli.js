import React from 'react'
import PropTypes from 'prop-types'
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
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        asiointikieli: PropTypes.object,
    })}),
    koodisto: PropTypes.shape({
        kieli: PropTypes.array,
    }),
    locale: PropTypes.string,
    henkiloUpdate: PropTypes.shape({
        asiointiKieli: PropTypes.shape({
            kieliKoodi: PropTypes.string,
        }),
    }),
};

export default Asiointikieli;
