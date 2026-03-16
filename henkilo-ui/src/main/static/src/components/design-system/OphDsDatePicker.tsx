import React from 'react';
import ReactDatepicker, { DatePickerProps } from 'react-datepicker';

const icon = (disabled?: boolean) => (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.4693 3H19.4458V1H17.3989V3H7.16421V1H5.11727V3H4.09381C2.96799 3 2.04688 3.9 2.04688 5V21C2.04688 22.1 2.96799 23 4.09381 23H20.4693C21.5951 23 22.5162 22.1 22.5162 21V5C22.5162 3.9 21.5951 3 20.4693 3ZM20.4693 21H4.09381V10H20.4693V21ZM20.4693 8H4.09381V5H20.4693V8Z"
            fill={disabled ? '#B2B2B2' : '#0033CC'}
        />
    </svg>
);

export const OphDsDatepicker = (props: DatePickerProps) => {
    return (
        <ReactDatepicker
            isClearable={!props.disabled}
            clearButtonClassName="oph-ds-datepicker-clear"
            showIcon
            icon={icon(props.disabled)}
            className="oph-ds-input"
            dateFormat="d.M.yyyy"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            showWeekNumbers
            placeholderText="pp.kk.vvvv"
            {...props}
        />
    );
};
