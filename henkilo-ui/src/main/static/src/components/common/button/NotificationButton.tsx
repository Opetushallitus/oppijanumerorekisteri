import Button from "./Button"
import React from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {removeNotification} from "../../../actions/notifications.actions"

// Do not use directly but by one of the wrappers of this class.
class NotificationButton extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        inputRef: PropTypes.func.isRequired,
        styles: PropTypes.shape({
            top: PropTypes.string.isRequired,
            left: PropTypes.string.isRequired,
            position: PropTypes.string.isRequired,
        }).isRequired,
        arrowDirection: PropTypes.string.isRequired,
    }

    render() {
        const notification = this.props.notifications.filter(
            notification => notification.id === this.props.id,
        )[0]
        let arrowDirectionStyle
        let style = {...this.props.styles}
        if (this.props.arrowDirection === "down") {
            arrowDirectionStyle = "oph-popup oph-popup-error oph-popup-top"
        } else if (this.props.arrowDirection === "up") {
            arrowDirectionStyle = "oph-popup oph-popup-error oph-popup-bottom"
            style = {...style, marginBottom: "10px"}
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
                        <div className="oph-popup-title">
                            {this.props.L[notification.notL10nMessage]}
                        </div>
                        <div className="oph-popup-content">
                            {this.props.L[notification.notL10nText]}
                        </div>
                    </div>
                ) : null}
            </div>
        )
    }

    hide() {
        this.props.removeNotification(
            "error",
            "buttonNotifications",
            this.props.id,
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        notifications: state.notifications.buttonNotifications,
        l10n: state.l10n.localisations,
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
    }
}

export default connect(mapStateToProps, {removeNotification})(
    NotificationButton,
)