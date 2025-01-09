import './CKHaeButton.css';
import React from 'react';
import { Localisations } from '../../../../types/localisation.type';
import ValidationMessageButton from '../../button/ValidationMessageButton';
import { ValidationMessage } from '../../../../types/validation.type';

type Props = {
    L: Localisations;
    validationMessages: {
        [key: string]: ValidationMessage;
    };
    haeButtonAction: () => void;
};

const CKHaeButton = ({ haeButtonAction, validationMessages, L }: Props) => (
    <tr key="kayttooikeusHaeButton">
        <td />
        <td>
            <ValidationMessageButton validationMessages={validationMessages} buttonAction={haeButtonAction}>
                {L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}
            </ValidationMessageButton>
        </td>
        <td />
    </tr>
);

export default CKHaeButton;
