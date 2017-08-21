import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import LabelValue from "./LabelValue";

const Salasana = (props) => <div>
    <LabelValue {...props} values={{
        label: 'HENKILO_PASSWORD',
        value: '',
        inputValue: 'password',
        disabled: props.disabled,
        password: true,
    }} />
    <LabelValue {...props} values={{
        label: 'HENKILO_PASSWORDAGAIN',
        value: '',
        inputValue: 'passwordAgain',
        disabled: props.disabled,
        password: true,
    }} />
    <LabelValue {...props}
                readOnly={true}
                required={false}
                hideLabel={true}
                values={{
                    label: 'EMPTY_PLACEHOLDER',
                    value: props.L['REKISTEROIDY_PASSWORD_TEXT'],
                    className: 'oph-h6',
                }}
    />
</div>;

Salasana.propTypes = {
    disabled: PropTypes.bool,
};

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(Salasana);
