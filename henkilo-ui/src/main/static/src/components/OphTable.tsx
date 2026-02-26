import React, { useRef, ReactElement, Fragment, LegacyRef } from 'react';
import { Table, flexRender, Row, ColumnDef } from '@tanstack/react-table';

import { useLocalisations } from '../selectors';
import Loader from './common/icons/Loader';

import '../react-table.css';

export type OphTableProps<T> = {
    table: Table<T>;
    isLoading: boolean;
    renderSubComponent?: (props: { row: Row<T> }) => ReactElement;
};

export function expanderColumn<T, U>(): ColumnDef<T, U> {
    return {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
            return (
                row.getCanExpand() && (
                    <button
                        className={`reset-button-styles expander-button ${row.getIsExpanded() ? 'open' : ''}`}
                        onClick={row.getToggleExpandedHandler()}
                        style={{ cursor: 'pointer' }}
                    >
                        {''}
                    </button>
                )
            );
        },
    };
}

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
                                                        <span className="fa-stack fa-lg oph-sort-asc">
                                                            <i
                                                                className="fa fa-sort-desc fa-stack-1x"
                                                                aria-hidden="true"
                                                            ></i>
                                                            <i
                                                                className="fa fa-sort-asc fa-stack-1x"
                                                                aria-hidden="true"
                                                            ></i>
                                                        </span>
                                                    </>
                                                ) : header.column.getIsSorted() === 'desc' ? (
                                                    <>
                                                        {' '}
                                                        <span className="fa-stack fa-lg oph-sort-desc">
                                                            <i
                                                                className="fa fa-sort-desc fa-stack-1x"
                                                                aria-hidden="true"
                                                            ></i>
                                                            <i
                                                                className="fa fa-sort-asc fa-stack-1x"
                                                                aria-hidden="true"
                                                            ></i>
                                                        </span>
                                                    </>
                                                ) : (
                                                    header.column.getCanSort() && (
                                                        <>
                                                            {' '}
                                                            <span className="fa-stack fa-lg none">
                                                                <i
                                                                    className="fa fa-sort-desc fa-stack-1x"
                                                                    aria-hidden="true"
                                                                ></i>
                                                                <i
                                                                    className="fa fa-sort-asc fa-stack-1x"
                                                                    aria-hidden="true"
                                                                ></i>
                                                            </span>
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
                                if (pageRef.current) {
                                    pageRef.current.value = String(table.getState().pagination.pageIndex);
                                }
                                table.previousPage();
                            }}
                            disabled={isLoading || !table.getCanPreviousPage()}
                        >
                            {L('TAULUKKO_EDELLINEN')}
                        </button>
                    </div>
                    <div className="center">
                        <span className="page-info">
                            {L('TAULUKKO_SIVU')}
                            <div className="page-jump">
                                <input
                                    ref={pageRef as LegacyRef<HTMLInputElement> | undefined}
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
                                        {pageSize} {L('TAULUKKO_RIVIA')}
                                    </option>
                                ))}
                            </select>
                        </span>
                    </div>
                    <div className="next">
                        <button
                            className="border rounded p-1"
                            onClick={() => {
                                if (pageRef.current) {
                                    pageRef.current.value = String(table.getState().pagination.pageIndex + 2);
                                }
                                table.nextPage();
                            }}
                            disabled={isLoading || !table.getCanNextPage()}
                        >
                            {L('TAULUKKO_SEURAAVA')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OphTable;
