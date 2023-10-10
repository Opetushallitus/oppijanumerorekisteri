import React from 'react';
import OphModal from '../modal/OphModal';
import './AccessRightDetails.css';
import type { TableCellProps } from '../../../types/react-table.types';

export type AccessRight = {
    name: string;
    description: string;
    onClose: () => void;
};

export const AccessRightDetaisLink = <T,>({
    cellProps,
    clickHandler,
}: {
    cellProps: TableCellProps<T>;
    clickHandler: (kayttooikeusRyhma: T) => void;
}) => (
    <button
        className="oph-button oph-button-ghost"
        onClick={() => clickHandler(cellProps.original.kayttooikeusRyhma)}
        style={{ cursor: 'help', textAlign: 'left' }}
    >
        {cellProps.value}
    </button>
);

const AccessRightDetails = ({ name, description, onClose }: AccessRight) => (
    <OphModal title={name} onClose={onClose} onOverlayClick={onClose}>
        <div className="accessRightDescription">{description}</div>
    </OphModal>
);

export default AccessRightDetails;
