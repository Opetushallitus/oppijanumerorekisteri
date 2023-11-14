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
    buttonClass,
}: {
    nimi: string;
    kayttooikeusRyhma: T;
    clickHandler: (kayttooikeusRyhma: T) => void;
    buttonClass?: string;
}) => (
    <button
        className={`oph-button oph-button-ghost ${buttonClass ?? ''}`}
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
