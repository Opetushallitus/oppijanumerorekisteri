import React from 'react';
import './TextButton.css';

type Props = {
    children: React.ReactNode;
    action: () => void;
};

const TextButton = ({ children, action }: Props) => (
    <span className="text-button" onClick={action}>
        {children}
    </span>
);

export default TextButton;
