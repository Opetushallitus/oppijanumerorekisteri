import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import PopupButton from '../../button/PopupButton';
import PassinumeroPopupContent from './PassinumeroPopupContent';
import { readPassinumerot, writePassinumerot } from '../../../../actions/passinumerot.actions';

type OwnProps = {
    oid: string;
    styles: any;
    disabled?: boolean;
};

type StateProps = {
    payload: string[];
    loading: boolean;
    translate: (key: string) => string;
};

type DispatchProps = {
    readPassinumerot: (oid: string) => void;
    writePassinumerot: (oid: string, passinumerot: string[]) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const PassinumeroButton = ({
    oid,
    styles,
    translate,
    disabled,
    loading,
    payload,
    readPassinumerot,
    writePassinumerot,
}: Props) => (
    <PopupButton
        popupStyle={styles}
        popupTitle={
            <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                {translate('PASSINUMEROT')}:
            </span>
        }
        popupClass={'oph-popup-default oph-popup-bottom'}
        disabled={disabled}
        popupButtonWrapperPositioning={'relative'}
        popupContent={
            <PassinumeroPopupContent
                oid={oid}
                translate={translate}
                loading={loading}
                passinumerot={payload}
                readPassinumerot={readPassinumerot}
                writePassinumerot={writePassinumerot}
            />
        }
    >
        {translate('HALLITSE_PASSINUMEROITA')}
    </PopupButton>
);

const mapStateToProps = (state: RootState): StateProps => ({
    ...state.passinumerot,
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    readPassinumerot,
    writePassinumerot,
})(PassinumeroButton);
