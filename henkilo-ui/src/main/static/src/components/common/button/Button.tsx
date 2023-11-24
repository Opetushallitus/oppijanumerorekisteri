import './Button.css';
import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames/bind';
import Loader from '../icons/Loader';

type ButtonProps = {
    id?: string;
    action?: (arg0: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
    href?: string;
    confirm?: boolean;
    big?: boolean;
    cancel?: boolean;
    isButton?: boolean;
    children?: ReactNode;
    className?: string;
    key?: string;
    loading?: boolean;
    dataTestId?: string;
    style?: CSSProperties;
};

class Button extends React.Component<ButtonProps> {
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
        return this.props.href ? (
            <a
                href={this.props.href}
                onClick={this.props.action}
                className={this.props.isButton ? className : ''}
                data-test-id={this.props.dataTestId}
                style={this.props.style}
            >
                {this.props.children}
            </a>
        ) : (
            <button
                id={this.props.id}
                type="button"
                className={className}
                disabled={this.props.disabled || this.props.loading}
                onClick={this.props.action}
                data-test-id={this.props.dataTestId}
                style={this.props.style}
            >
                {this.props.loading && <Loader inButton={true} />}
                {this.props.children}
            </button>
        );
    }
}

export default Button;
