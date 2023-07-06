import React from 'react';
import NotificationButton from './NotificationButton';
import type CSS from 'csstype';

type Props = {
    id: string;
    action: (foo?: any) => any; // TODO: ???
    disabled?: boolean;
};

type State = {
    styles: CSS.Properties;
};
// Style wrapper for NotificationButton
class BottomNotificationButton extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            styles: {
                top: '0',
                left: '0',
                position: 'relative',
            },
        };
    }

    componentDidMount() {
        this.setState({
            styles: {
                top: '20px',
                left: '0',
                position: 'relative',
            },
        });
    }

    render() {
        return (
            <NotificationButton
                {...this.props}
                styles={this.state.styles}
                // @ts-ignore - TODO: don't understand
                inputRef={(el) => (this.inputElement = el)}
                arrowDirection={'up'}
            />
        );
    }
}

export default BottomNotificationButton;
