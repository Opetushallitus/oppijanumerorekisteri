import React, { ReactNode } from 'react';

import { useLocalisations } from '../../selectors';
import { SpringPageModel } from '../../api/oppijanumerorekisteri';
import Loader from '../common/icons/Loader';

type TableProps = {
    headers: string[];
    isFetching: boolean;
    page?: PageProps;
    placeholder?: string;
    rows: ReactNode[][];
    rowDescriptionPartitive?: string;
    sortOrder?: SortOrder;
    setSortOrder?: (sortOrder?: SortOrder) => void;
};

export type PageProps = {
    page: SpringPageModel;
    setPage: (p: number) => void;
};

export type SortOrder = {
    sortBy: string;
    asc: boolean;
};

const getRenderedPageRange = (page?: SpringPageModel) => {
    if (!page) {
        return [];
    }
    if (page.totalPages <= 8) {
        return [...Array(page.totalPages).keys()];
    }
    if (page.number < 4) {
        return [...Array(5).keys(), undefined, page.totalPages - 1];
    }
    if (page.number > page.totalPages - 5) {
        return [0, undefined, ...[...Array(5).keys()].map((i) => i + page.totalPages - 5)];
    }
    return [0, undefined, ...[...Array(5).keys()].map((i) => i + page.number - 2), undefined, page.totalPages - 1];
};

const Pagination = ({ page, setPage }: PageProps) => {
    const { L } = useLocalisations();
    const renderedPageRange = getRenderedPageRange(page);
    return (
        <nav
            aria-labelledby="pagination"
            style={{ display: 'flex', justifyContent: 'center', padding: '16px', gap: '4px' }}
        >
            <h2 id="pagination" style={{ display: 'none' }}>
                {L('TAULUKKO_SIVUNUMEROINTI')}
            </h2>
            {
                <button
                    className="oph-ds-button oph-ds-button-transparent"
                    onClick={() => setPage(page.number - 1)}
                    disabled={page.number === 0}
                >
                    {L('TAULUKKO_EDELLINEN')}
                </button>
            }
            {renderedPageRange.map((p, i) => {
                if (p !== undefined) {
                    return (
                        <button
                            key={`page-${i}`}
                            className={`oph-ds-button ${p === page.number ? '' : 'oph-ds-button-transparent'}`}
                            aria-current={p === page.number ? 'page' : undefined}
                            onClick={() => setPage(p)}
                        >
                            {p + 1}
                        </button>
                    );
                } else {
                    return (
                        <div key={`page-${i}`} className="oph-ds-table-page-dots">
                            ...
                        </div>
                    );
                }
            })}
            <button
                className="oph-ds-button oph-ds-button-transparent"
                onClick={() => setPage(page.number + 1)}
                disabled={page.number === page.totalPages - 1}
            >
                {L('TAULUKKO_SEURAAVA')}
            </button>
        </nav>
    );
};

export const OphDsTable = ({
    headers,
    isFetching,
    page,
    placeholder,
    rows,
    rowDescriptionPartitive,
    sortOrder,
    setSortOrder,
}: TableProps) => {
    const totalElements = page ? page?.page.totalElements : rows.length;

    const sortBy = (header: string) => {
        if (!setSortOrder) {
            return;
        }
        if (header !== sortOrder?.sortBy) {
            setSortOrder({ sortBy: header, asc: true });
        } else if (sortOrder.asc === undefined) {
            setSortOrder({ sortBy: header, asc: true });
        } else if (sortOrder.asc === true) {
            setSortOrder({ sortBy: header, asc: false });
        } else {
            setSortOrder(undefined);
        }
    };

    return (
        <div style={{ width: '100%', overflowY: 'scroll' }}>
            {rowDescriptionPartitive && (
                <p
                    aria-live="polite"
                    aria-atomic="true"
                    data-testid={`${rowDescriptionPartitive}-count`}
                    style={{ marginBottom: '1rem' }}
                >
                    {`${totalElements} ${rowDescriptionPartitive}`}
                </p>
            )}
            <table className="oph-ds-table">
                <thead>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={`${h}-${i}`}>
                                {setSortOrder ? (
                                    <button className="oph-ds-table-header-button" onClick={() => sortBy(h)}>
                                        <span>{h}</span>
                                        <span
                                            className={`oph-ds-table-header-button-${sortOrder?.sortBy === h && sortOrder.asc ? 'asc' : sortOrder?.sortBy === h && sortOrder.asc === false ? 'desc' : 'unsorted'}`}
                                        ></span>
                                    </button>
                                ) : (
                                    h
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, ri) => (
                        <tr key={`tr-${ri}`}>
                            {r.map((c, ci) => (
                                <td key={`td-${ri}-${ci}`}>{c}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ padding: '16px' }}>
                {isFetching ? <Loader /> : <div style={{ padding: '12px' }}></div>}
                {placeholder && !isFetching && (
                    <div className="oph-ds-table-placeholder">
                        <svg width="55" height="54" viewBox="0 0 55 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="27.0641" cy="26.7489" rx="27.0641" ry="26.7489" fill="#F6F6F6" />
                            <path
                                d="M26.3066 21.2109H32.3773V23.2109H26.3066V21.2109ZM26.3066 25.2109H32.3773V27.2109H26.3066V25.2109ZM26.3066 29.2109H32.3773V31.2109H26.3066V29.2109ZM22.2594 21.2109H24.283V23.2109H22.2594V21.2109ZM22.2594 25.2109H24.283V27.2109H22.2594V25.2109ZM22.2594 29.2109H24.283V31.2109H22.2594V29.2109ZM35.5138 17.2109H19.1229C18.617 17.2109 18.2123 17.6109 18.2123 18.1109V34.3109C18.2123 34.7109 18.617 35.2109 19.1229 35.2109H35.5138C35.9185 35.2109 36.4244 34.7109 36.4244 34.3109V18.1109C36.4244 17.6109 35.9185 17.2109 35.5138 17.2109ZM34.4009 33.2109H20.2359V19.2109H34.4009V33.2109Z"
                                fill="#4C4C4C"
                            />
                        </svg>
                        <div>{placeholder}</div>
                    </div>
                )}
            </div>
            {page && page.page.totalPages > 1 && <Pagination page={page.page} setPage={page.setPage} />}
        </div>
    );
};
