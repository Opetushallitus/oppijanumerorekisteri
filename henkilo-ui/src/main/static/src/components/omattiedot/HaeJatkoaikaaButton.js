import React from 'react'
import {connect} from 'react-redux';
import ConfirmButton from "../common/button/ConfirmButton";

const HaeJatkoaikaaButton = ({haeJatkoaikaaAction, l10n, locale}) =>
    <ConfirmButton action={haeJatkoaikaaAction}
                   id="haeJatkoaikaaButton"
                   normalLabel={l10n[locale]['OMATTIEDOT_HAE_JATKOAIKAA']}
                   confirmLabel={l10n[locale]['OMATTIEDOT_HAE_JATKOAIKAA_CONFIRM']} />;

HaeJatkoaikaaButton.propTypes = {
    haeJatkoaikaaAction: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
    };
};

export default connect(mapStateToProps, {})(HaeJatkoaikaaButton);
