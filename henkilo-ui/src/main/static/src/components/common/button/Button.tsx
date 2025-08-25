import './Button.css';
import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
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

const Button = (props: ButtonProps) => {
    const classNameProp = props.className ? props.className : '';
    const className = classNames({
        'oph-button': true,
        'oph-button-primary': !props.confirm && !props.cancel,
        'oph-button-confirm': props.confirm,
        'oph-button-big': props.big,
        'oph-button-cancel': props.cancel,
        [`${classNameProp}`]: classNameProp,
    });
    return props.href ? (
        <a
            href={props.href}
            onClick={props.action}
            className={props.isButton ? className : ''}
            data-test-id={props.dataTestId}
            style={props.style}
        >
            {props.children}
        </a>
    ) : (
        <button
            id={props.id}
            type="button"
            className={className}
            disabled={props.disabled || props.loading}
            onClick={props.action}
            data-test-id={props.dataTestId}
            style={props.style}
        >
            {props.loading && <Loader inButton={true} />}
            {props.children}
        </button>
    );
};

export default Button;
