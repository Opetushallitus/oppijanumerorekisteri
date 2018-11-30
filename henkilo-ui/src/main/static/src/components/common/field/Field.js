// @flow

import './Field.css';
import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames/bind';
import OphSelect from '../select/OphSelect'
import moment from 'moment';
import SimpleDatePicker from '../../henkilo/SimpleDatePicker'
import {validateEmail} from "../../../validation/EmailValidator";

type Props = {
    readOnly: boolean,
    changeAction: (any) => any,
    inputValue: string,
    selectValue?: string | boolean,
    password?: boolean,
    isEmail?: boolean,
    className?: string,
    disabled?: boolean,
    autofocus?: boolean,
    placeholder?: string,
    isError?: boolean,
    data?: any,
    date?: any,
    children: any,
    clearable?: boolean,
}

type State = {
    readOnly: boolean,
    inputError: boolean
}

class Field extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            readOnly: true,
            inputError: false
        };
    }

    render() {
        const classNamesCreator = {
            'field': true,
            'readOnly': this.props.readOnly,
            'oph-input': !this.props.readOnly && !this.props.data,
            'oph-input-has-error': this.props.isError || this.state.inputError,
        };
        if(this.props.className) {
            classNamesCreator[this.props.className] = this.props.className
        }
        const className = classNames(classNamesCreator);
        return <span>{this.createField(className)}</span>;
    }

    createField(className) {
        let type = 'text';

        if(this.props.password) {
            type = 'password';
        }
        if(this.props.isEmail) {
            type = 'email';
        }

        if (this.props.readOnly) {
            return <span className={className}>{this.getReadOnlyValue()}</span>;
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
            return <SimpleDatePicker className="oph-input"
                               onChange={(value) => this.props.changeAction({target: {
                                   value: value,
                                   name: this.props.inputValue,
                               }})}
                               value={this.props.children}
                               disabled={this.props.disabled}
            />;
        }
        return <input className={className}
                      name={this.props.inputValue}
                      key={this.props.inputValue}
                      onChange={(event) => {
                          this.setState({inputError: this.isValidEmailInputEvent(type, event)});
                          this.props.changeAction(event);
                      }}
                      defaultValue={this.props.children}
                      autoFocus={this.props.autofocus}
                      placeholder={this.props.placeholder}
                      disabled={this.props.disabled}
                      type={type}
        />;
    }

    isValidEmailInputEvent(type: string, event: SyntheticEvent<HTMLButtonElement>) {
        return type === 'email' && event.currentTarget.value !== '' && !validateEmail(event.currentTarget.value);
    }

    getReadOnlyValue() {
        if (this.props.data) {
            const selected = this.props.data.find(item => item.value === this.props.selectValue)
            return selected ? selected.label : null
    }
        return this.props.date && this.props.children
            ? moment(this.props.children).format()
            : this.props.children;
    }
}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(Field);