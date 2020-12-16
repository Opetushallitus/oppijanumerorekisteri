import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';

const DEFAULT_MODEL_FORMAT = 'YYYY-MM-DD';

type SimpleDatePickerProps = {
    className?: string;
    placeholder?: string;
    value: string | null | undefined;
    onChange: (value: string | null | undefined) => void;
    format?: string;
    disabled?: boolean;
    filterDate?: (date: Moment.Moment) => boolean;
};

/**
 * Päivämäärävalitsin, jossa arvona käytetään merkkijonoa, esim. "2017-10-25".
 */
class SimpleDatePicker extends React.Component<SimpleDatePickerProps> {
    render() {
        return (
            <DatePicker
                className={this.props.className}
                placeholder={this.props.placeholder}
                selected={this.getMomentValue()}
                onChange={this.onChange}
                showYearDropdown
                showWeekNumbers
                dropdownMode="select"
                disabled={this.props.disabled}
                filterDate={this.props.filterDate}
            />
        );
    }

    getMomentValue = (): Moment.Moment | undefined => {
        return this.props.value ? Moment(this.props.value, this.getModelFormat()) : null;
    };

    getModelFormat = (): string => {
        return this.props.format ? this.props.format : DEFAULT_MODEL_FORMAT;
    };

    onChange = (value?: Moment.Moment) => {
        this.props.onChange(value ? value.format(this.getModelFormat()) : null);
    };
}

export default SimpleDatePicker;
