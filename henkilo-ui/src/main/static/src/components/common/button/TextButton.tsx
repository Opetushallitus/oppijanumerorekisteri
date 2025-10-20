import React from 'react';
import './TextButton.css';

type Props = {
    children: React.ReactNode;
    action: () => void;
};

const TextButton = ({ children, action }: Props) => (
    <span role="button" tabIndex={0} className="text-button" onClick={action}>
        {children}
    </span>
);

export default TextButton;
