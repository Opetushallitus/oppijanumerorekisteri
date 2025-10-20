import './CloseButton.css';
import React from 'react';
import CloseIcon from '../icons/CloseIcon';

type Props = {
    closeAction: () => void;
};

const CloseButton = ({ closeAction }: Props) => (
    <span role="button" tabIndex={0} className="close-button" onClick={closeAction}>
        <CloseIcon />
    </span>
);

export default CloseButton;
