import './Button.css'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind';

class Button extends React.Component {

    static propTypes = {
        action: PropTypes.func,
        disabled: PropTypes.bool,
        href: PropTypes.string,
        confirm: PropTypes.bool,
        big: PropTypes.bool,
        cancel: PropTypes.bool,
        inputRef: PropTypes.func,
    };


    render() {
        const className = classNames({
            'oph-button': true,
            'oph-button-primary': !this.props.confirm && !this.props.cancel,
            'oph-button-confirm': this.props.confirm,
            'oph-button-big': this.props.big,
            'oph-button-cancel': this.props.cancel,
            [`${this.props.className}`]: this.props.className,
        });
        return (
            this.props.href
                ? <a href={this.props.href} className="a" onClick={this.props.action}>{this.props.children}</a>
                :
                <button className={className}
                        disabled={this.props.disabled}
                        onClick={this.props.action}
                        ref={this.props.inputRef}>
                    {this.props.children}
                </button>
        );
    };

}

export default Button;