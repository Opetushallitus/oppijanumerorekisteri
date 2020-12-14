import React from "react"
import PropTypes from "prop-types"
import NotificationButton from "./NotificationButton"

// Style wrapper for NotificationButton
class TopOverlayNotificationButton extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)
        this.state = {
            styles: {
                top: "0",
                left: "0",
                position: "absolute",
            },
        }
    }

    componentDidMount() {
        const rects = this.inputElement.getClientRects()[0]
        this.setState({
            styles: {
                top: rects.top - (rects.bottom - rects.top) + -150 + "px",
                left: rects.left + "px",
                position: "absolute",
            },
        })
    }

    render() {
        return (
            <NotificationButton
                {...this.props}
                styles={this.state.styles}
                inputRef={el => (this.inputElement = el)}
                arrowDirection={"down"}
            />
        )
    }
}

export default TopOverlayNotificationButton