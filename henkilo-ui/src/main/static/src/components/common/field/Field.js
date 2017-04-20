import React from 'react'
import Select2 from '../select/Select2';

import './Field.css';
import classNames from 'classnames/bind';

export default class Field extends React.Component {
    static propTypes = {
        readOnly: React.PropTypes.bool,
        changeAction: React.PropTypes.func,
        inputValue: React.PropTypes.string,
        selectValue: React.PropTypes.string,
        password: React.PropTypes.bool
    };

    constructor() {
        super();
        this.state = {readOnly: true};
    }

    render() {
        const className = classNames(
            {'field': true,
            [`${this.props.className}`]: this.props.className,
            'readOnly': this.props.readOnly,
            'oph-input': !this.props.readOnly && !this.props.data});
        const type = {type: this.props.password ? 'password' : false};
        const autoFocus = this.props.autoFocus;
        return (
            this.props.readOnly
                ? <span className={className}>{this.props.children}</span>
                : this.props.data
                    ? <Select2 data={this.props.data} name={this.props.inputValue} onSelect={this.props.changeAction}
                               value={this.props.selectValue} />
                    : <input className={className} name={this.props.inputValue} onChange={this.props.changeAction}
                         defaultValue={this.props.children} {...type} autoFocus={autoFocus} />
        )
    }
}
