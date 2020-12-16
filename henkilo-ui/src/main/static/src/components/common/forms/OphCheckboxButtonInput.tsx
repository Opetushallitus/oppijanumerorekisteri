import React from 'react';

type OphCheckboxButtonInputProps = {
    idName: string;
    value: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
    action: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
};

class OphCheckboxButtonInput extends React.Component<OphCheckboxButtonInputProps> {
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
