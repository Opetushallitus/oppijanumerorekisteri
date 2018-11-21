// @flow
import React from 'react';
import Button from "../button/Button";
import {SpinnerInButton} from "../icons/SpinnerInButton";
import OphModal from "./OphModal";

type SelectModalProps = {
    disabled: boolean,
    buttonText: string,
    children?: React$Element<any>,
    loading?: boolean,
}

type State = {
    visible: boolean,
}

/**
 * Näyttää ja piilottaa lapsena annetun modalin. Välittää piilottamistoiminnon tälle modalille.
 */
class SelectModal extends React.Component<SelectModalProps, State> {
    constructor(props: SelectModalProps) {
        super(props);

        this.state = {
            visible: false,
        };
    }

    render() {
        return <React.Fragment>
            <Button disabled={this.props.disabled || !!this.props.loading}
                    action={this._onOpen}>
                <SpinnerInButton show={!!this.props.loading}/> { this.props.buttonText }
            </Button>
            { this.state.visible
                ? <OphModal onClose={this._onClose}>
                    {this.props.children
                        ? React.cloneElement(this.props.children, { onClose: this._onClose.bind(this) })
                        : null}
                </OphModal>
                : null }
        </React.Fragment>
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