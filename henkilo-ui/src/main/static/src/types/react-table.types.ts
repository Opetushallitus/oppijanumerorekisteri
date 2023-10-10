export type TableHeading = {
    Cell?: any;
    key: string;
    localizationKey?: string;
    label?: string;
    maxWidth?: number;
    minWidth?: number;
    sortMethod?: (a: any, b: any, desc: boolean) => number;
    notSortable?: boolean;
    hide?: boolean;
};

export type TableCellProps<T> = {
    value: any;
    original?: {
        kayttooikeusRyhma?: T;
    };
};
