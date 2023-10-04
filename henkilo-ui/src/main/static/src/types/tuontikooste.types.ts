type Sort = {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
};

type Pageable = {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: true;
    sort: Sort;
    unpaged: true;
};

type Paged<T> = {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: Pageable;
    sort: Sort;
    size: number;
    totalElements: number;
    totalPages: number;
};

export type TuontiKoosteRivi = {
    id: number;
    timestamp: number;
    oid: string;
    author: string;
    successful: number;
    failures: number;
    total: number;
    inProgress: number;
    conflicts: number;
};

export type TuontiKoosteCriteria = {
    id?: string;
    author?: string;
    page: string;
    pageSize: string;
    field: keyof Omit<TuontiKoosteRivi, 'oid'>;
    sort: 'ASC' | 'DESC';
};

export type TuontiKooste = Paged<TuontiKoosteRivi>;
