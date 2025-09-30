import React from 'react';

import ConfirmButton from '../common/button/ConfirmButton';
import { useLocalisations } from '../../selectors';

type OwnProps = {
    haeJatkoaikaaAction: () => void;
    disabled: boolean;
};

const HaeJatkoaikaaButton = ({ haeJatkoaikaaAction, disabled }: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <ConfirmButton
            action={haeJatkoaikaaAction}
            normalLabel={L['OMATTIEDOT_HAE_JATKOAIKAA']}
            confirmLabel={L['OMATTIEDOT_HAE_JATKOAIKAA_CONFIRM']}
            disabled={disabled}
        />
    );
};

export default HaeJatkoaikaaButton;
