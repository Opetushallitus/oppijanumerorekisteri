import React from 'react';

type Props = {
    idName: string;
    value: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
    action: (arg0: any) => void; // TODO: Fix type
    // action: React.MouseEventHandler<HTMLInputElement>;
};

class OphCheckboxButtonInput extends React.Component<Props> {
    render() {
        return (
            <label htmlFor={this.props.idName}>
                <input
                    id={this.props.idName}
                    type="checkbox"
                    value={this.props.value}
                    checked={this.props.checked}
                    className="oph-checkbox-button-input"
                    disabled={this.props.disabled}
                    onClick={this.props.action}
                />
                <span className="oph-checkbox-button-text">{this.props.label}</span>
            </label>
        );
    }
}

export default OphCheckboxButtonInput;
