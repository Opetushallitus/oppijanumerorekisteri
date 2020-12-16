import React from 'react';
import { connect } from 'react-redux';
import PopupButton from '../../button/PopupButton';
import PasswordPopupContent from '../../button/PasswordPopupContent';
import { removeNotification } from '../../../../actions/notifications.actions';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    styles: any;
    disabled?: boolean;
    oidHenkilo: string;
};

type Props = OwnProps & {
    L: Localisations;
};

class PasswordButton extends React.Component<Props> {
    render() {
        return (
            <PopupButton
                popupClass={'oph-popup-default oph-popup-bottom oph-popup-password'}
                disabled={this.props.disabled}
                popupButtonWrapperPositioning={'relative'}
                popupStyle={this.props.styles}
                popupTitle={
                    <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                        {this.props.L['SALASANA_ASETA']}
                    </span>
                }
                popupContent={<PasswordPopupContent oidHenkilo={this.props.oidHenkilo} />}
            >
                {this.props.L['SALASANA_ASETA']}
            </PopupButton>
        );
    }
}

const mapStateToProps = state => {
    return {
        notifications: state.notifications,
        L: state.l10n.localisations[state.locale],
    };
};

export default connect<Props, OwnProps>(mapStateToProps, {
    removeNotification,
})(PasswordButton);
