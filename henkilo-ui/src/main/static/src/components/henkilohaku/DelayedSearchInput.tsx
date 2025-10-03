import React, { useEffect, useState } from 'react';

import { useDebounce } from '../../useDebounce';

type SearchQuery = (value: string) => void;

type DelayedSearchInputProps = {
    setSearchQueryAction: SearchQuery;
    defaultNameQuery?: string;
    placeholder?: string;
    customTimeout?: number;
    minSearchValueLength?: number;
};

const DelayedSearchInput = ({
    setSearchQueryAction,
    defaultNameQuery,
    placeholder,
    minSearchValueLength,
}: DelayedSearchInputProps) => {
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);

    useEffect(() => {
        if (debouncedSearch.length > (minSearchValueLength ?? 0) || debouncedSearch.length === 0) {
            setSearchQueryAction(debouncedSearch);
        }
    }, [debouncedSearch]);

    return (
        <input
            className="oph-input"
            autoFocus
            defaultValue={defaultNameQuery}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={placeholder}
        />
    );
};

export default DelayedSearchInput;
