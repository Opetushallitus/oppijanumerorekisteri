import React, { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

type SearchQuery = (value: string) => void;

type DelayedSearchInputProps = {
    setSearchQueryAction: SearchQuery;
    loading?: boolean;
    defaultNameQuery?: string;
    placeholder?: string;
    customTimeout?: number;
    minSearchValueLength?: number;
};

const DelayedSearchInput = ({
    setSearchQueryAction,
    loading,
    defaultNameQuery,
    placeholder,
    customTimeout,
    minSearchValueLength,
}: DelayedSearchInputProps) => {
    const debouncedSearch = useCallback(debounce(setSearchQueryAction, customTimeout ?? 500), []);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        if (searchInput.length > (minSearchValueLength ?? 0) && !loading) {
            debouncedSearch(searchInput);
        }
    }, [searchInput]);

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
