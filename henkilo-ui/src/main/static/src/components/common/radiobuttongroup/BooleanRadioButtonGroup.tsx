import React from 'react';

type Props = {
    value: boolean;
    onChange: (event: boolean) => void;
    trueLabel: string;
    falseLabel: string;
    className?: string;
};

/**
 * Tyylioppaan mukainen "Radio button group" -komponentti totuusarvoille.
 */
const BooleanRadioButtonGroup = (props: Props) => {
    const onChange = (event) => {
        props.onChange(event.target.value === 'true');
    };

    return (
        <fieldset className={`oph-fieldset ${props.className ?? ''}`}>
            <div className="oph-radio-button-group">
                <label>
                    <input
                        className="oph-radio-button-input"
                        type="radio"
                        value="false"
                        checked={props.value === false}
                        onChange={onChange}
                    />
                    <span className="oph-radio-button-text">{props.falseLabel}</span>
                </label>
                <label>
                    <input
                        className="oph-radio-button-input"
                        type="radio"
                        value="true"
                        checked={props.value === true}
                        onChange={onChange}
                    />
                    <span className="oph-radio-button-text">{props.trueLabel}</span>
                </label>
            </div>
        </fieldset>
    );
};

export default BooleanRadioButtonGroup;
