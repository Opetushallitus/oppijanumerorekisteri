import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import ConfirmButton from "../common/button/ConfirmButton";

const HaeJatkoaikaaButton = ({haeJatkoaikaaAction, l10n, locale, disabled}) =>
    <ConfirmButton action={haeJatkoaikaaAction}
                   id="haeJatkoaikaaButton"
                   normalLabel={l10n[locale]['OMATTIEDOT_HAE_JATKOAIKAA']}
                   confirmLabel={l10n[locale]['OMATTIEDOT_HAE_JATKOAIKAA_CONFIRM']}
                   disabled={disabled} />;

HaeJatkoaikaaButton.propTypes = {
    haeJatkoaikaaAction: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
    };
};

export default connect(mapStateToProps, {})(HaeJatkoaikaaButton);
