import React from 'react';

type Props = {
    value: boolean;
    onChange: (event: boolean) => void;
    trueLabel: string;
    falseLabel: string;
};

/**
 * Tyylioppaan mukainen "Radio button group" -komponentti totuusarvoille.
 */
class BooleanRadioButtonGroup extends React.Component<Props> {
    render() {
        return (
            <fieldset className="oph-fieldset">
                <div className="oph-radio-button-group">
                    <label>
                        <input
                            className="oph-radio-button-input"
                            type="radio"
                            value="false"
                            checked={this.props.value === false}
                            onChange={this.onChange}
                        />
                        <span className="oph-radio-button-text">{this.props.falseLabel}</span>
                    </label>
                    <label>
                        <input
                            className="oph-radio-button-input"
                            type="radio"
                            value="true"
                            checked={this.props.value === true}
                            onChange={this.onChange}
                        />
                        <span className="oph-radio-button-text">{this.props.trueLabel}</span>
                    </label>
                </div>
            </fieldset>
        );
    }

    onChange = (event) => {
        this.props.onChange(event.target.value === 'true');
    };
}

export default BooleanRadioButtonGroup;
