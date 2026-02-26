import React from 'react';
import type CSS from 'csstype';

import PopupButton from '../../button/PopupButton';
import PassinumeroPopupContent from './PassinumeroPopupContent';
import { useLocalisations } from '../../../../selectors';

type Props = {
    oid: string;
    styles: CSS.Properties;
    disabled?: boolean;
};

const PassinumeroButton = ({ oid, styles, disabled }: Props) => {
    const { L } = useLocalisations();
    return (
        <PopupButton
            id="passinumero-button"
            popupStyle={styles}
            popupTitle={
                <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                    {L('PASSINUMEROT')}:
                </span>
            }
            popupClass={'oph-popup-default oph-popup-bottom'}
            disabled={disabled}
            popupButtonWrapperPositioning={'relative'}
            popupContent={<PassinumeroPopupContent oid={oid} />}
        >
            {L('HALLITSE_PASSINUMEROITA')}
        </PopupButton>
    );
};

export default PassinumeroButton;
