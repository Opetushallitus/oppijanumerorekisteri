// @flow
import React from 'react'
import DatePicker from 'react-datepicker'
import Moment from 'moment'

const DEFAULT_MODEL_FORMAT = 'YYYY-MM-DD'

type Props = {
    className?: string,
    placeholder?: string,
    value: ?string,
    onChange: (value: ?string) => void,
    format?: string,
}

/**
 * Päivämäärävalitsin, jossa arvona käytetään merkkijonoa, esim. "2017-10-25".
 */
class SimpleDatePicker extends React.Component<Props> {

    render() {
        return (
            <DatePicker
                className={this.props.className}
                placeholder={this.props.placeholder}
                selected={this.getMomentValue()}
                onChange={this.onChange}
                showYearDropdown
                dropdownMode="select"
                />
        )
    }

    getMomentValue = (): ?Moment => {
        return this.props.value ? Moment(this.props.value, this.getModelFormat()) : null
    }

    getModelFormat = (): string => {
        return this.props.format ? this.props.format : DEFAULT_MODEL_FORMAT
    }

    onChange = (value: ?Moment) => {
        this.props.onChange(value ? value.format(this.getModelFormat()) : null)
    }

}

export default SimpleDatePicker
