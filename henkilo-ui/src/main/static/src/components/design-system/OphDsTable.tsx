import React, { ReactNode } from 'react';

type PageProps = {
    headers: string[];
    rows: ReactNode[][];
    rowDescriptionPartitive?: string;
};

export const OphDsTable = ({ headers, rows, rowDescriptionPartitive }: PageProps) => {
    return (
        <div>
            {rowDescriptionPartitive && (
                <div
                    className="oph-ds-table-results"
                    aria-live="polite"
                    aria-atomic="true"
                    data-testid={`${rowDescriptionPartitive}-count`}
                >{`${rows.length} ${rowDescriptionPartitive}`}</div>
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
        </div>
    );
};
