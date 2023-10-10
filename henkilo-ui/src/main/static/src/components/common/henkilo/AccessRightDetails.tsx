import React from 'react';
import OphModal from '../modal/OphModal';
import './AccessRightDetails.css';

export type AccessRight = {
    name: string;
    description: string;
    onClose: () => void;
};

export const AccessRightDetaisLink = <T,>({
    nimi,
    kayttooikeusRyhma,
    clickHandler,
}: {
    nimi: string;
    kayttooikeusRyhma: T;
    clickHandler: (kayttooikeusRyhma: T) => void;
}) => (
    <button
        className="oph-button oph-button-ghost"
        onClick={() => clickHandler(kayttooikeusRyhma)}
        style={{ cursor: 'help', textAlign: 'left' }}
    >
        {nimi}
    </button>
);

const AccessRightDetails = ({ name, description, onClose }: AccessRight) => (
    <OphModal title={name} onClose={onClose} onOverlayClick={onClose}>
        <div className="accessRightDescription">{description}</div>
    </OphModal>
);

export default AccessRightDetails;
