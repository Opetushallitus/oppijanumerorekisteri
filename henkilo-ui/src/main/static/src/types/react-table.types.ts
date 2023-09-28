import * as React from 'react';
import { MyonnettyKayttooikeusryhma } from './domain/kayttooikeus/kayttooikeusryhma.types';

export type TableHeading = {
    Cell?: React.ReactNode | string | ((arg0: TableCellProps) => React.ReactNode | string);
    key: string;
    localizationKey?: string;
    label?: string;
    maxWidth?: number;
    minWidth?: number;
    sortMethod?: (a: any, b: any, desc: boolean) => number;
    notSortable?: boolean;
    hide?: boolean;
};

export type TableCellProps = {
    value: any;
    original?: {
        kayttooikeusRyhma?: MyonnettyKayttooikeusryhma;
    };
};
