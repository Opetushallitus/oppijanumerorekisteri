import * as React from 'react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

type LocalNotificationProps = {
    type: NotificationType;
    title?: string;
    toggle?: boolean;
    onClose?: () => void;
    children?: React.ReactElement | React.ReactElement[] | string;
};

type State = {
    show: boolean; // Internally handled visibility. TRUE by default and set to FALSE when close action is run.
    toggle: () => boolean; // Visibility by prop. Notification can be hidden and shown multiple times
};

/*
 * Local notification (handles its visibility internally).
 * If toggle is undefined at start automatically handles hiding of whole element according to if children are defined.
 *
 * @param type: Notification type ALERT, INFO, SUCCESS, WARNING
 * @param title: Title for notification.
 * @param show: Is notification visible
 * @param onClose: Optional function to run when notification is closed
 * @param children: Optional content to be added after title https://opetushallitus.github.io/virkailija-styles/styleguide/src__modules__alerts.css.html
 */
export class LocalNotification extends React.Component<LocalNotificationProps, State> {
    constructor(props: LocalNotificationProps) {
        super(props);

        this.state = {
            show: true,
            toggle:
                this.props.toggle === true || this.props.toggle === false
                    ? () => this.props.toggle === true
                    : () => !!this._childrenIsValid(),
        };
    }

    render() {
        return this.state.show && this.state.toggle() ? (
            <div className={`oph-alert oph-alert-${this.props.type}`}>
                <div className="oph-alert-container">
                    <div className="oph-alert-title">{this.props.title}</div>
                    <div className="oph-alert-text">{this.props.children}</div>
                    <button
                        className="oph-button oph-button-close"
                        type="button"
                        title="Close"
                        aria-label="Close"
                        onClick={() => this.closeAction()}
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
            </div>
        ) : null;
    }

    closeAction = () => {
        this.setState({ show: false });
        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    _childrenIsValid() {
        return React.Children.map(this.props.children, this._childIsValid)?.every(Boolean);
    }

    _childIsValid(child?: React.ReactNode) {
        return !!(child && React.isValidElement(child) && child.type === 'ul' && child.props && child.props.children);
    }
}
