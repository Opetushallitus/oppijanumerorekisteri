import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from "./LabelValue";

const Kayttajanimi = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_KAYTTAJANIMI',
    value: props.henkilo.kayttajatieto.username,
    inputValue: 'kayttajanimi',
    disabled: props.disabled,
    isError: props.isError,
}} />;

Kayttajanimi.propTypes = {
    henkilo: PropTypes.shape({
        kayttajatieto: PropTypes.shape({
            username: PropTypes.string,
        }).isRequired,
    }).isRequired,
    disabled: PropTypes.bool.isRequired,
    isError: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Kayttajanimi);
