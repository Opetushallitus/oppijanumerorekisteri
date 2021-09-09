import React from 'react';
import OphModal from '../modal/OphModal';
import './AccessRightDetails.css';
import type { TableCellProps } from '../../../types/react-table.types';

export type Props = {
    name: string;
    description: string;
    onClose: () => void;
};

export type TextGroup = {
    text: string;
    lang: string;
};

export const resolveLocalizedText = (textGroups: Array<TextGroup> = [], lang: string = 'fi'): string =>
    [...textGroups, { text: '', lang: lang.toUpperCase() }].filter(
        (textGroup) => (textGroup.lang || 'fi').toUpperCase() === lang.toUpperCase()
    )[0].text;

export const AccessRightDetaisLinkColumn = ({
    cellProps,
    clickHandler,
}: {
    cellProps: TableCellProps & { original: any };
    clickHandler: (accessRightGroup: any) => void;
}) => (
    <button
        className="oph-button oph-button-ghost"
        onClick={() => clickHandler(cellProps.original.accessRightGroup)}
        style={{ cursor: 'help', textAlign: 'left' }}
    >
        {cellProps.value}
    </button>
);

const AccessRightDetails = ({ name, description, onClose }: Props) => (
    <OphModal title={name} onClose={() => onClose()}>
        <div className="accessRightDescription">{description}</div>
    </OphModal>
);

export default AccessRightDetails;
