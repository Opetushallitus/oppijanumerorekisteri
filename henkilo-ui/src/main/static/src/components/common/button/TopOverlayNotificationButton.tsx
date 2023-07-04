import React from 'react';
import PropTypes from 'prop-types';
import NotificationButton from './NotificationButton';
import type CSS from 'csstype';

type Props = {
    id: string;
    action?: () => void;
    disabled?: boolean;
    errorMessage?: string;
    confirm?: boolean;
};

type State = {
    styles: CSS.Properties;
};

// Style wrapper for NotificationButton
class TopOverlayNotificationButton extends React.Component<Props, State> {
    static propTypes = {
        id: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            styles: {
                top: '0',
                left: '0',
                position: 'absolute',
            },
        };
    }

    componentDidMount() {
        // @ts-ignore - TODO: What is this
        const rects = this.inputElement.getClientRects()[0];
        this.setState({
            styles: {
                top: rects.top - (rects.bottom - rects.top) + -150 + 'px',
                left: rects.left + 'px',
                position: 'absolute',
            },
        });
    }

    render() {
        return (
            <NotificationButton
                {...this.props}
                styles={this.state.styles}
                // @ts-ignore - TODO: What is this
                inputRef={(el) => (this.inputElement = el)}
                arrowDirection={'down'}
            />
        );
    }
}

export default TopOverlayNotificationButton;
