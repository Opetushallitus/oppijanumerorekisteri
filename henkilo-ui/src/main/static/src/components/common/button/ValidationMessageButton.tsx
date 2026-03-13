import React, { ReactNode } from 'react';

import { ValidationMessage } from '../../../types/validation.type';
import { OphDsBanner } from '../../design-system/OphDsBanner';

type Props = {
    children: ReactNode;
    validationMessages: Record<string, ValidationMessage>;
    buttonAction: (event: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
};

// Nappi jonka oikealla puolella tulostuvat mustat validointitekstit. Olettaa kaikkien syötteiden olevan lokalisoituja.
// Nappi on disabloitu niin kauan kuin virheviestejä esiintyy.
const ValidationMessageButton = (props: Props) => {
    return (
        <div>
            <div>
                <button
                    className="oph-ds-button"
                    disabled={
                        !!props.disabled ||
                        Object.keys(props.validationMessages).some((key) => !props.validationMessages[key]?.isValid)
                    }
                    onClick={props.buttonAction}
                >
                    {props.children}
                </button>
            </div>
            {Object.values(props.validationMessages).filter((m) => !m.isValid).length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <OphDsBanner type="error">
                        <ul style={{ marginLeft: '1rem' }}>
                            {Object.keys(props.validationMessages)
                                .filter((key) => !props.validationMessages[key]?.isValid)
                                .map((key, idx) => (
                                    <li key={idx} style={{ listStyleType: 'disc' }}>
                                        {props.validationMessages[key]?.labelLocalised}
                                    </li>
                                ))}
                        </ul>
                    </OphDsBanner>
                </div>
            )}
        </div>
    );
};

export default ValidationMessageButton;
