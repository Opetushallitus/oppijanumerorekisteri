// @flow
import './CKHaeButton.css'
import React from 'react'
import PropTypes from 'prop-types'
import type {L} from "../../../../types/localisation.type";
import ValidationMessageButton from "../../button/ValidationMessageButton";

type Props = {
    L: L,
    validationMessages: Array<{id: string, label: string}>,
    haeButtonAction: () => void,
}

const CKHaeButton = ({haeButtonAction, validationMessages, L}: Props ) =>
    <tr key="kayttooikeusHaeButton">
        <td />
        <td>
            <ValidationMessageButton validationMessages={validationMessages.map(message => ({...message, labelLocalised: L[message.label]}))}
                                     buttonAction={haeButtonAction}>
                {L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}
            </ValidationMessageButton>
        </td>
        <td/>
    </tr>;

CKHaeButton.propTypes = {
    L: PropTypes.object,
    haeButtonAction: PropTypes.func,
    validationMessages: PropTypes.array,
};

export default CKHaeButton;