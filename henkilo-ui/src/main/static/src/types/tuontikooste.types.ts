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

type TuontikoosteRivi = {
    aikaleima: number;
    kayttaja: string;
    successful: number;
    total: number;
};

export type TuontiKooste = Paged<TuontikoosteRivi>;
