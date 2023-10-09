import React, { useRef, ReactElement, Fragment } from 'react';
import { Table, flexRender, Row } from '@tanstack/react-table';

import { useLocalisations } from '../selectors';

import '../oph-table.css';
import Loader from './common/icons/Loader';
import SortAscIcon from './common/icons/SortAscIcon';
import SortDescIcon from './common/icons/SortDescIcon';
import SortIconNone from './common/icons/SortIconNone';

export type OphTableProps<T> = {
    table: Table<T>;
    isLoading: boolean;
    renderSubComponent?: (props: { row: Row<T> }) => ReactElement;
};

export const expanderColumn = {
    id: 'expander',
    header: () => null,
    className: 'expander',
    cell: ({ row }) => {
        return (
            row.getCanExpand() && (
                <button
                    className={`reset-button-styles expander-button ${row.getIsExpanded() ? 'open' : ''}`}
                    onClick={row.getToggleExpandedHandler()}
                    style={{ cursor: 'pointer' }}
                >
                    {row.getIsExpanded() ? '' : ''}
                </button>
            )
        );
    },
};

const OphTable = <T,>({ table, isLoading, renderSubComponent }: OphTableProps<T>) => {
    const { L } = useLocalisations();
    const pageRef = useRef<HTMLInputElement>();
    return (
        <div className={`react-table ${renderSubComponent ? 'expandable-table' : ''}`}>
            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className="rt-resizable-header rt-th"
                                        style={{ position: 'relative', width: header.getSize() }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <button
                                                className="reset-button-styles"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === 'asc' ? (
                                                    <>
                                                        {' '}
                                                        <SortAscIcon />
                                                    </>
                                                ) : header.column.getIsSorted() === 'desc' ? (
                                                    <>
                                                        {' '}
                                                        <SortDescIcon />
                                                    </>
                                                ) : (
                                                    header.column.getCanSort() && (
                                                        <>
                                                            {' '}
                                                            <SortIconNone />
                                                        </>
                                                    )
                                                )}
                                            </button>
                                        )}
                                        {header.column.getCanResize() && (
                                            <button
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`reset-button-styles resizer ${
                                                    header.column.getIsResizing() ? 'isResizing' : ''
                                                }`}
                                            />
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Fragment key={row.id}>
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <td
                                                key={cell.id}
                                                style={{ width: cell.column.getSize() }}
                                                className="rt-td"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        );
                                    })}
                                </tr>
                                {row.getIsExpanded() && renderSubComponent && (
                                    <tr>
                                        <td colSpan={row.getVisibleCells().length}>{renderSubComponent({ row })}</td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
            {isLoading && <Loader />}
            {table.getPageCount() > 1 && (
                <div className="pagination">
                    <div className="previous">
                        <button
                            className="button"
                            onClick={() => {
                                pageRef.current.value = String(table.getState().pagination.pageIndex);
                                table.previousPage();
                            }}
                            disabled={isLoading || !table.getCanPreviousPage()}
                        >
                            {L['TAULUKKO_EDELLINEN']}
                        </button>
                    </div>
                    <div className="center">
                        <span className="page-info">
                            {L['TAULUKKO_SIVU']}
                            <div className="page-jump">
                                <input
                                    ref={pageRef}
                                    type="number"
                                    defaultValue={table.getState().pagination.pageIndex || 0 + 1}
                                    onChange={(e) => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 1;
                                        table.setPageIndex(page);
                                    }}
                                />
                            </div>
                            /{table.getPageCount()}
                        </span>
                        <span className="page-select">
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => {
                                    table.setPageSize(Number(e.target.value));
                                }}
                            >
                                {[10, 20, 50, 100].map((pageSize) => (
                                    <option key={pageSize} value={pageSize}>
                                        {pageSize} {L['TAULUKKO_RIVIA']}
                                    </option>
                                ))}
                            </select>
                        </span>
                    </div>
                    <div className="next">
                        <button
                            className="border rounded p-1"
                            onClick={() => {
                                pageRef.current.value = String(table.getState().pagination.pageIndex + 2);
                                table.nextPage();
                            }}
                            disabled={isLoading || !table.getCanNextPage()}
                        >
                            {L['TAULUKKO_SEURAAVA']}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OphTable;
