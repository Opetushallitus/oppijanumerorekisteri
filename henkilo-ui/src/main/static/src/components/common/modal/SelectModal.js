// @flow
import React from 'react';
import {SpinnerInButton} from "../icons/SpinnerInButton";
import OphModal from "./OphModal";
import ValidationMessageButton from "../button/ValidationMessageButton";
import type {ValidationMessage} from "../../../types/validation.type";

type SelectModalProps = {
    disabled: boolean,
    buttonText: string,
    children?: React$Element<any>,
    loading?: boolean,
    validationMessages?: {[string]: ValidationMessage}
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
            <ValidationMessageButton disabled={this.props.disabled || !!this.props.loading}
                                     validationMessages={this.props.validationMessages || {}}
                                     buttonAction={this._onOpen}>
                <SpinnerInButton show={!!this.props.loading}/> { this.props.buttonText }
            </ValidationMessageButton>
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