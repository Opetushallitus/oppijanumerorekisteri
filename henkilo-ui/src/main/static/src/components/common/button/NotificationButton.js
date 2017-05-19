import Button from "./Button";
import React from 'react'
import {connect} from 'react-redux';
import {removeNotification} from "../../../actions/notifications.actions";

class NotificationButton extends React.Component {
    static propTypes = {
        id: React.PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            styles: {
                top: 0,
                left: 0,
            },
        }
    };

    componentDidMount() {
        this.L = this.props.l10n[this.props.locale];
        this.setState({
            styles: {
                top: this.inputElement.getClientRects()[0].top + -200 + 'px',
                left: this.inputElement.getClientRects()[0].left + 'px',
            }
        });
    };

    render() {
        const notification = this.props.notifications.filter(notification => notification.id === this.props.id)[0];
        return <div className="popup-button">
            <Button {...this.props} inputRef={el => this.inputElement = el}/>
            {
                notification
                    ?
                    <div className="oph-popup oph-popup-error oph-popup-top"
                         style={{position: 'absolute', top: this.state.styles.top, left: this.state.styles.left}}>
                        <button className="oph-button oph-button-close" type="button" title="Close" aria-label="Close"
                                onClick={this.hide.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <div className="oph-popup-arrow" />
                        <div className="oph-popup-title">{this.L[notification.notL10nMessage]}</div>
                        <div className="oph-popup-content">{this.L[notification.notL10nText]}</div>
                    </div>
                    : null
            }
        </div>
    };

    hide() {
        this.props.removeNotification('error', 'buttonNotifications', this.props.id);
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        notifications: state.notifications.buttonNotifications,
        l10n: state.l10n.localisations,
        locale: state.locale,
    };
};

export default connect(mapStateToProps, {removeNotification})(NotificationButton);
