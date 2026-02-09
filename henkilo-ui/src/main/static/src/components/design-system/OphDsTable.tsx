import React, { ReactNode } from 'react';

import { useLocalisations } from '../../selectors';
import { SpringPageModel } from '../../api/oppijanumerorekisteri';
import Loader from '../common/icons/Loader';

type TableProps = {
    headers: string[];
    isFetching: boolean;
    page?: PageProps;
    rows: ReactNode[][];
    rowDescriptionPartitive?: string;
};

type PageProps = {
    page: SpringPageModel;
    setPage: (p: number) => void;
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
                {L['TAULUKKO_SIVUNUMEROINTI']}
            </h2>
            {
                <button
                    className="oph-ds-button oph-ds-button-transparent"
                    onClick={() => setPage(page.number - 1)}
                    disabled={page.number === 0}
                >
                    {L['TAULUKKO_EDELLINEN']}
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
                {L['TAULUKKO_SEURAAVA']}
            </button>
        </nav>
    );
};

export const OphDsTable = ({ headers, isFetching, page, rows, rowDescriptionPartitive }: TableProps) => {
    const { L } = useLocalisations();
    const totalElements = page ? page?.page.totalElements : rows.length;
    return (
        <div>
            {rowDescriptionPartitive && (
                <h2
                    className="oph-ds-table-results"
                    aria-live="polite"
                    aria-atomic="true"
                    data-testid={`${rowDescriptionPartitive}-count`}
                >
                    {L['HENKILOHAKU_HAKUTULOKSET'] + ` (${totalElements} ${rowDescriptionPartitive})`}
                </h2>
            )}
            <table className="oph-ds-table">
                <thead>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={`${h}-${i}`}>{h}</th>
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
            <div style={{ padding: '16px' }}>{isFetching ? <Loader /> : <div style={{ padding: '12px' }}></div>}</div>
            {page && page.page.totalPages > 1 && <Pagination page={page.page} setPage={page.setPage} />}
        </div>
    );
};
