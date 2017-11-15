// @flow
import React from 'react';
import Button from "./Button";
import type {ValidationMessage} from "../../../types/validation.type";

type Props = {
    children: any,
    validationMessages: Array<ValidationMessage>,
    buttonAction: () => void,
}

// Nappi jonka oikealla puolella tulostuvat mustat validointitekstit. Olettaa kaikkien syötteiden olevan lokalisoituja.
// Nappi on disabloitu niin kauan kuin virheviestejä esiintyy.
const ValidationMessageButton = (props: Props) => <div>
    <div className="haeButtonWrapper">
        <Button id="hae_ko_button" disabled={props.validationMessages.length > 0} action={props.buttonAction}>
            {props.children}
        </Button>
    </div>
    <div className="haeButtonWrapper">
        <ul>
            {
                props.validationMessages.map((validationMessage, idx) =>
                    <li key={idx} className="oph-h5">! {validationMessage.labelLocalised}</li>
                )
            }
        </ul>
    </div>
</div>;

export default ValidationMessageButton;
