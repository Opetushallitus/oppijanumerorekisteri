import React from 'react';

import './EmailVerificationList.css';
import { Yhteystieto } from '../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { validateEmail } from '../../validation/EmailValidator';
import { Localisations } from '../../types/localisation.type';

type Props = {
    yhteystieto: Yhteystieto;
    onEmailChange: (arg2: string) => void;
    onEmailRemove: () => void;
    L: Localisations;
    emailFieldCount: number;
};

/*
 * Yhteystietoryhma-listan sähköpostiosoitteet input-kenttinä
 */
export const EmailVerificationList = ({ emailFieldCount, L, onEmailChange, onEmailRemove, yhteystieto }: Props) => (
    <span>
        <input
            className={`oph-input email-verification-field ${validateEmail(yhteystieto.yhteystietoArvo ?? '') ? 'oph-input-has-error' : ''}`}
            defaultValue={yhteystieto.yhteystietoArvo}
            type="text"
            placeholder={L['HENKILO_TYOSAHKOPOSTI']}
            onChange={(e) => onEmailChange(e.target.value)}
        />
        {emailFieldCount > 1 ? (
            <i
                role="button"
                tabIndex={0}
                className="fa fa-times-circle oph-blue email-verification-remove"
                onClick={() => onEmailRemove()}
            />
        ) : null}
    </span>
);
