// @flow
import './Button.css'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind';

type Props = {
    action?: (Event) => void,
    disabled?: boolean,
    href?: string,
    confirm?: boolean,
    big?: boolean,
    cancel?: boolean,
    inputRef?: () => void,
    isButton?: boolean,
    children: any,
    className?: string,
    key?: string,
}

class Button extends React.Component<Props> {

    static propTypes = {
        action: PropTypes.func,
        disabled: PropTypes.bool,
        href: PropTypes.string,
        confirm: PropTypes.bool,
        big: PropTypes.bool,
        cancel: PropTypes.bool,
        inputRef: PropTypes.func,
        isButton: PropTypes.bool,
    };


    render() {
        const classNameProp = this.props.className ? this.props.className : '';
        const className = classNames({
            'oph-button': true,
            'oph-button-primary': !this.props.confirm && !this.props.cancel,
            'oph-button-confirm': this.props.confirm,
            'oph-button-big': this.props.big,
            'oph-button-cancel': this.props.cancel,
            [`${classNameProp}`]: classNameProp,
        });
        return (
            this.props.href
                ?
                <a href={this.props.href}
                   onClick={this.props.action}
                   className={this.props.isButton ? className : ''}>
                    {this.props.children}
                </a>
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