import './Field.css';
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind';
import OphSelect from '../select/OphSelect'

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
            'field-error': this.props.isError,
        });
        const type = {type: this.props.password ? 'password' : false};
        return (
            this.props.readOnly
                ? <span className={className}>{this.props.children}</span>
                : this.props.data
                    ? <OphSelect options={this.props.data}
                                 name={this.props.inputValue}
                                 onChange={this.props.changeAction}
                                 value={this.props.selectValue}
                                 placeholder=""
                                 disabled={this.props.disabled} />
                    : <input className={className}
                             name={this.props.inputValue}
                             key={this.props.inputValue}
                             onChange={this.props.changeAction}
                             defaultValue={this.props.children}
                             {...type}
                             autoFocus={this.props.autofocus}
                             placeholder={this.props.placeholder}
                             disabled={this.props.disabled} />
        )
    }
}

export default Field;