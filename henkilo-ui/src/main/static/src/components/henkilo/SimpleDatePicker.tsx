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
const SimpleDatePicker = (props: SimpleDatePickerProps) => {
    const getMomentValue = (): Date | null => {
        return props.value ? Moment(props.value, getModelFormat()).toDate() : null;
    };

    const getModelFormat = (): string => {
        return props.format ? props.format : DEFAULT_MODEL_FORMAT;
    };

    const onChange = (value: Date | null) => {
        props.onChange(value ? Moment(value).format(getModelFormat()) : null);
    };

    return (
        <DatePicker
            className={props.className}
            placeholderText={props.placeholder}
            selected={getMomentValue()}
            onChange={onChange}
            showYearDropdown
            showWeekNumbers
            dropdownMode="select"
            disabled={props.disabled}
            filterDate={props.filterDate}
            dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
        />
    );
};

export default SimpleDatePicker;
