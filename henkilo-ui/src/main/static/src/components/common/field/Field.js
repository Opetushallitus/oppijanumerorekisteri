import './Field.css';
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import OphSelect from '../select/OphSelect'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import StaticUtils from "../StaticUtils";
import PropertySingleton from "../../../globals/PropertySingleton";

class Field extends React.Component {
    static propTypes = {
        readOnly: PropTypes.bool,
        changeAction: PropTypes.func,
        inputValue: PropTypes.string,
        selectValue: PropTypes.string,
        password: PropTypes.bool,
        disabled: PropTypes.bool,
        autofocus: PropTypes.bool,
        placeholder: PropTypes.string,
        isError: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {readOnly: true};
    }

    render() {
        const className = classNames({
            'field': true,
            [`${this.props.className}`]: this.props.className,
            'readOnly': this.props.readOnly,
            'oph-input': !this.props.readOnly && !this.props.data,
            'oph-input-has-error': this.props.isError,
        });
        return <span>{this.createField(className)}</span>;
    }

    createField(className) {
        const type = {type: this.props.password ? 'password' : 'text'};
        if (this.props.readOnly) {
            return <span className={className}>{this.props.children}</span>;
        }
        if (this.props.data) {
            return <OphSelect
                className={className}
                options={this.props.data}
                name={this.props.inputValue}
                onChange={this.props.changeAction}
                value={this.props.selectValue}
                placeholder=""
                disabled={this.props.disabled}
                clearable={this.props.clearable}
            />;
        }
        if (this.props.date) {
            return <DatePicker className="oph-input"
                               onChange={(value) => this.props.changeAction({target: {
                                   value: value.format(PropertySingleton.state.PVM_DBFORMAATTI),
                                   name: this.props.inputValue,
                               }})}
                               selected={moment(StaticUtils.ddmmyyyyToDate(this.props.children))}
                               showYearDropdown
                               showWeekNumbers
                               disabled={this.props.disabled}
            />;
        }
        return <input className={className}
                      name={this.props.inputValue}
                      key={this.props.inputValue}
                      onChange={this.props.changeAction}
                      defaultValue={this.props.children}
                      {...type}
                      autoFocus={this.props.autofocus}
                      placeholder={this.props.placeholder}
                      disabled={this.props.disabled}
        />;
    }
}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(Field);