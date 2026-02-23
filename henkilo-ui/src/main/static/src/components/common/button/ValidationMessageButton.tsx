import React, { ReactNode } from 'react';
import Button from './Button';
import { ValidationMessage } from '../../../types/validation.type';

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
            <div className="haeButtonWrapper">
                <Button
                    disabled={
                        !!props.disabled ||
                        Object.keys(props.validationMessages).some((key) => !props.validationMessages[key]?.isValid)
                    }
                    action={props.buttonAction}
                >
                    {props.children}
                </Button>
            </div>
            {Object.keys(props.validationMessages).length > 0 && (
                <div className="haeButtonWrapper">
                    <ul>
                        {Object.keys(props.validationMessages)
                            .filter((key) => !props.validationMessages[key]?.isValid)
                            .map((key, idx) => (
                                <li key={idx} className="oph-h5">
                                    ! {props.validationMessages[key]?.labelLocalised}
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ValidationMessageButton;
