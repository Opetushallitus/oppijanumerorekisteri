// @flow
import * as React from 'react';

export type TableHeading = {
    Cell?: React.Node | string | (TableCellProps) => React.Node | string,
    key: string,
    label?: string,
    maxWidth?: number,
    minWidth?: number,
    notSortable?: boolean,
    hide?: boolean
}

export type TableCellProps = {
    value: any,
}
