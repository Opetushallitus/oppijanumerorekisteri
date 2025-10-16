import React from 'react';
import ConfirmButton from '../../button/ConfirmButton';
import { Localisations } from '../../../../types/localisation.type';

type Props = {
    L: Localisations;
    suljeAction: () => void;
    disabled: boolean;
};

const SuljeButton = ({ L, suljeAction, disabled }: Props) => (
    <ConfirmButton
        action={suljeAction}
        normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE']}
        confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE_CONFIRM']}
        disabled={disabled}
    />
);

export default SuljeButton;
