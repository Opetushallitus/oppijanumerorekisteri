import React from 'react';
import ConfirmButton from '../../button/ConfirmButton';
import { Localisations } from '../../../../types/localisation.type';

type Props = {
    L: Localisations;
    hylkaaAction: () => void;
    disabled: boolean;
};

const HylkaaButton = ({ L, hylkaaAction, disabled }: Props) => (
    <ConfirmButton
        action={hylkaaAction}
        confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_CONFIRM']}
        normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA']}
        key="hylkaa"
        id="hylkaa"
        disabled={disabled}
    />
);

export default HylkaaButton;
