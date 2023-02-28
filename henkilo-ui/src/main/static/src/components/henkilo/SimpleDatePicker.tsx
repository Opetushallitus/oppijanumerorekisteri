import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import PropertySingleton from '../../globals/PropertySingleton';

const DEFAULT_MODEL_FORMAT = 'YYYY-MM-DD';

type SimpleDatePickerProps = {
    className?: string;
    placeholder?: string;
    value: string | null | undefined;
    onChange: (value: string | null | undefined) => void;
    format?: string;
    disabled?: boolean;
    filterDate?: (date: Date) => boolean;
};

/**
 * Päivämäärävalitsin, jossa arvona käytetään merkkijonoa, esim. "2017-10-25".
 */
class SimpleDatePicker extends React.Component<SimpleDatePickerProps> {
    render() {
        return (
            <DatePicker
                className={this.props.className}
                placeholderText={this.props.placeholder}
                selected={this.getMomentValue()}
                onChange={this.onChange}
                showYearDropdown
                showWeekNumbers
                dropdownMode="select"
                disabled={this.props.disabled}
                filterDate={this.props.filterDate}
                dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
            />
        );
    }

    getMomentValue = (): Date | undefined => {
        return this.props.value ? Moment(this.props.value, this.getModelFormat()).toDate() : null;
    };

    getModelFormat = (): string => {
        return this.props.format ? this.props.format : DEFAULT_MODEL_FORMAT;
    };

    onChange = (value?: Date) => {
        this.props.onChange(value ? Moment(value).format(this.getModelFormat()) : null);
    };
}

export default SimpleDatePicker;
