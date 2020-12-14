import React from "react"
import OphCheckboxButtonInput from "./OphCheckboxButtonInput"

type Option = {
    label: string
    value: string
    checked: boolean
    disabled?: boolean
}

type OphCheckboxListProps = {
    legendText: string
    options: Array<Option>
    selectAction: (arg0: React.SyntheticEvent<HTMLInputElement>) => void
}

class OphCheckboxFieldset extends React.Component<OphCheckboxListProps> {
    random

    constructor(props: Props) {
        super(props)

        this.random = Math.random()
    }

    render() {
        return (
            <fieldset className="oph-fieldset">
                <legend className="oph-label">{this.props.legendText}</legend>
                {this.props.options.map((option, idx) => (
                    <OphCheckboxButtonInput
                        key={this.random + idx}
                        idName={"label" + this.random + idx}
                        value={option.value}
                        label={option.label}
                        checked={option.checked}
                        disabled={option.disabled}
                        action={this.props.selectAction}
                    />
                ))}
            </fieldset>
        )
    }
}

export default OphCheckboxFieldset