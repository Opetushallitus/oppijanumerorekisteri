import './Button.css'
import React from 'react'
import classNames from 'classnames/bind';

export default class Button extends React.Component {

    static propTypes = {
        action: React.PropTypes.func,
        disabled: React.PropTypes.bool,
        href: React.PropTypes.string,
        confirm: React.PropTypes.bool,
        big: React.PropTypes.bool
    };

    render() {
        const className = classNames({
            'oph-button': true,
            'oph-button-primary': !this.props.confirm,
            'oph-button-confirm': this.props.confirm,
            'oph-button-big': this.props.big,
            [`${this.props.className}`]: this.props.className
        });

        return (
            this.props.href
                ? <a href={this.props.href} className="a" onClick={this.props.action}>{this.props.children}</a>
                : <button className={className} disabled={this.props.disabled} onClick={!this.props.disabled ? this.props.action : () => {}}>{this.props.children}</button>
        );
    }
}

