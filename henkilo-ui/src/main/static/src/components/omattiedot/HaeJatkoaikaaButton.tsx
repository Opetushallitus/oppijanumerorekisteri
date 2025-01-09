import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import type { Localisations } from '../../types/localisation.type';
import ConfirmButton from '../common/button/ConfirmButton';

type OwnProps = {
    haeJatkoaikaaAction: () => void;
    disabled: boolean;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const HaeJatkoaikaaButton = ({ haeJatkoaikaaAction, L, disabled }: Props) => (
    <ConfirmButton
        action={haeJatkoaikaaAction}
        id="haeJatkoaikaaButton"
        normalLabel={L['OMATTIEDOT_HAE_JATKOAIKAA']}
        confirmLabel={L['OMATTIEDOT_HAE_JATKOAIKAA_CONFIRM']}
        disabled={disabled}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(HaeJatkoaikaaButton);
