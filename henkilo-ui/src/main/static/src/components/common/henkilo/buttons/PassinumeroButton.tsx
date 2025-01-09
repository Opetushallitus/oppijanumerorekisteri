import React from 'react';
import type CSS from 'csstype';

import PopupButton from '../../button/PopupButton';
import PassinumeroPopupContent from './PassinumeroPopupContent';

type Props = {
    oid: string;
    styles: CSS.Properties;
    disabled?: boolean;
    translate: (key: string) => string;
};

const PassinumeroButton = ({ oid, styles, disabled, translate }: Props) => (
    <PopupButton
        id="passinumero-button"
        popupStyle={styles}
        popupTitle={
            <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                {translate('PASSINUMEROT')}:
            </span>
        }
        popupClass={'oph-popup-default oph-popup-bottom'}
        disabled={disabled}
        popupButtonWrapperPositioning={'relative'}
        popupContent={<PassinumeroPopupContent oid={oid} translate={translate} />}
    >
        {translate('HALLITSE_PASSINUMEROITA')}
    </PopupButton>
);

export default PassinumeroButton;
