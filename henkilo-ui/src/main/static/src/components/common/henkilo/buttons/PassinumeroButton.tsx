import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import PopupButton from '../../button/PopupButton';
import PassinumeroPopupContent from './PassinumeroPopupContent';

type OwnProps = {
    oid: string;
    styles: any;
    disabled?: boolean;
};

type StateProps = {
    translate: (key: string) => string;
};

type Props = OwnProps & StateProps;

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

const mapStateToProps = (state: RootState): StateProps => ({
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(PassinumeroButton);
