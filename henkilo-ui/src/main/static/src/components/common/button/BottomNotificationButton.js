import React from 'react'
import PropTypes from 'prop-types'
import NotificationButton from "./NotificationButton";

// Style wrapper for NotificationButton
class BottomNotificationButton extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            styles: {
                top: '0',
                left: '0',
                position: 'relative',
            },
        }
    }

    componentDidMount() {
        this.setState({
            styles: {
                top: '20px',
                left: '0',
                position: 'relative',
            }
        });
    }

    render() {
        return <NotificationButton {...this.props}
                                   styles={this.state.styles}
                                   inputRef={el => this.inputElement = el}
                                   arrowDirection={'up'} />;
    }

}

export default BottomNotificationButton;
