// @flow
import React, {Fragment} from 'react';
import Button from "../button/Button";
import {SpinnerInButton} from "../icons/SpinnerInButton";
import OphModal from "./OphModal";

type Props = {
    disabled: boolean,
    buttonText: string,
    children: React.Node,
}

type State = {
    visible: boolean,
}

class SelectModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            visible: false
        };
    }

    render() {
        return <Fragment>
            <Button disabled={this.props.disabled}
                    action={this._onOpen}>
                <SpinnerInButton show={this.props.disabled}/> { this.props.buttonText }
            </Button>
            { this.state.visible
                ? <OphModal onClose={this._onClose}>
                    {React.cloneElement(this.props.children, { onClose: this._onClose.bind(this) })}
                </OphModal>
                : null }
        </Fragment>
    }

    _onOpen = (event: SyntheticEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        this.setState({visible: true});
    };

    _onClose = (event?: SyntheticEvent<HTMLButtonElement>): void => {
        if (event) {
            event.preventDefault();
        }
        this.setState({visible: false});
    };

}

export default SelectModal;