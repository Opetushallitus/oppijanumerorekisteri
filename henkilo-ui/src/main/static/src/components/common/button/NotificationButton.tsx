import Button from './Button';
import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import type { L10n, Localisations } from '../../../types/localisation.type';
import type { Notification } from '../../../reducers/notifications.reducer';
import type { Locale } from '../../../types/locale.type';
import { removeNotification } from '../../../actions/notifications.actions';
import type CSS from 'csstype';

type OwnProps = {
    id: string;
    inputRef: () => void;
    styles: Pick<CSS.Properties, 'top' | 'left' | 'position'>;
    arrowDirection: string;
};

type StateProps = {
    notifications: Notification[];
    l10n: L10n;
    locale: Locale;
    L: Localisations;
};

type DispatchProps = {
    removeNotification: (status: string, group: string, id: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

// Do not use directly but by one of the wrappers of this class.
class NotificationButton extends React.Component<Props> {
    render() {
        const notification = this.props.notifications.filter((item) => item.id === this.props.id)[0];
        let arrowDirectionStyle;
        let style: CSS.Properties = { ...this.props.styles };
        if (this.props.arrowDirection === 'down') {
            arrowDirectionStyle = 'oph-popup oph-popup-error oph-popup-top';
        } else if (this.props.arrowDirection === 'up') {
            arrowDirectionStyle = 'oph-popup oph-popup-error oph-popup-bottom';
            style = { ...style, marginBottom: '10px' };
        }
        return (
            <div className="popup-button">
                <Button {...this.props} inputRef={this.props.inputRef} />
                {notification ? (
                    <div className={arrowDirectionStyle} style={style}>
                        <button
                            className="oph-button oph-button-close"
                            type="button"
                            title="Close"
                            aria-label="Close"
                            onClick={this.hide.bind(this)}
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                        <div className="oph-popup-arrow" />
                        <div className="oph-popup-title">{this.props.L[notification.notL10nMessage]}</div>
                        <div className="oph-popup-content">{this.props.L[notification.notL10nText]}</div>
                    </div>
                ) : null}
            </div>
        );
    }

    hide() {
        this.props.removeNotification('error', 'buttonNotifications', this.props.id);
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    notifications: state.notifications.buttonNotifications,
    l10n: state.l10n.localisations,
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, { removeNotification })(
    NotificationButton
);
