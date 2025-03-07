import React, { ReactNode } from 'react';
import Button from './Button';
import { ValidationMessage } from '../../../types/validation.type';

type Props = {
    children: ReactNode;
    validationMessages: {
        [key: string]: ValidationMessage;
    };
    buttonAction: (event: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
};

// Nappi jonka oikealla puolella tulostuvat mustat validointitekstit. Olettaa kaikkien syötteiden olevan lokalisoituja.
// Nappi on disabloitu niin kauan kuin virheviestejä esiintyy.
class ValidationMessageButton extends React.Component<Props> {
    render() {
        return (
            <div>
                <div className="haeButtonWrapper">
                    <Button
                        disabled={
                            !!this.props.disabled ||
                            Object.keys(this.props.validationMessages).some(
                                (key) => !this.props.validationMessages[key].isValid
                            )
                        }
                        action={this.props.buttonAction}
                    >
                        {this.props.children}
                    </Button>
                </div>
                {Object.keys(this.props.validationMessages).length > 0 && (
                    <div className="haeButtonWrapper">
                        <ul>
                            {Object.keys(this.props.validationMessages)
                                .filter((key) => !this.props.validationMessages[key].isValid)
                                .map((key, idx) => (
                                    <li key={idx} className="oph-h5">
                                        ! {this.props.validationMessages[key].labelLocalised}
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default ValidationMessageButton;
