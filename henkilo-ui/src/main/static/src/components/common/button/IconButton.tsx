import './IconButton.css';
import React, { ReactNode } from 'react';

type Props = {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
};

const IconButton = ({ onClick, href, children }: Props) =>
    onClick ? (
        <span role="button" tabIndex={0} className="icon-button" onClick={onClick}>
            {children}
        </span>
    ) : (
        <a href={href}>{children}</a>
    );

export default IconButton;
