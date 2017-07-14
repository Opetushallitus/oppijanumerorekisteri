import './CKHaeButton.css'
import React from 'react'
import PropTypes from 'prop-types'
import Button from "../../button/Button";

const CKHaeButton = ({haeButtonAction, validationMessages, L}) =>
    <tr key="kayttooikeusHaeButton">
        <td />
        <td>
            <div className="haeButtonWrapper">
                <Button id="hae_ko_button" disabled={validationMessages.length > 0} action={haeButtonAction}>
                    {L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}
                </Button>
            </div>
            <div  className="haeButtonWrapper">
            <ul>
                {
                    validationMessages.map((validationMessage, idx) =>
                        <li key={idx} className="oph-h5">{L[validationMessage.label]}</li>
                    )
                }
            </ul>
            </div>
        </td>
        <td/>
    </tr>;

CKHaeButton.propTypes = {
    L: PropTypes.object,
    haeButtonAction: PropTypes.func,
    validationMessages: PropTypes.array,
};

export default CKHaeButton;