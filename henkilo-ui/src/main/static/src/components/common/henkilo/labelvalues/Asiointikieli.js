import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import LabelValue from "./LabelValue";

const Asiointikieli = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_ASIOINTIKIELI',
    data: props.koodisto.kieli
        .filter(koodi => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
        .map(koodi => ({
            value: koodi.value,
            label: koodi[props.locale],
            optionsName: 'asiointiKieli.kieliKoodi',
        })),
    // For readOnly view
    value: props.henkilo && props.henkilo.henkilo.asiointiKieli && props.koodisto.kieli
        .filter(kieli => kieli.value === props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][props.locale],
    // For edit view
    selectValue: props.henkiloUpdate.asiointiKieli && props.henkiloUpdate.asiointiKieli.kieliKoodi,
}} />;

Asiointikieli.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        asiointikieli: PropTypes.shape({
            kieliKoodi: PropTypes.string,
        }),
    })}),
    koodisto: PropTypes.shape({
        kieli: PropTypes.array,
    }),
    henkiloUpdate: PropTypes.shape({
        asiointiKieli: PropTypes.shape({
            kieliKoodi: PropTypes.string,
        }),
    }),
};

const mapStateToProps = (state, ownProps) => ({
    locale: state.locale,
});

export default connect(mapStateToProps)(Asiointikieli);
