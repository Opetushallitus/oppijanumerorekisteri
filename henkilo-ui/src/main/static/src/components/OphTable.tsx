import React, { useRef } from 'react';
import { Table, flexRender } from '@tanstack/react-table';

import { useLocalisations } from '../selectors';

import '../oph-table.css';
import Loader from './common/icons/Loader';

type Props<T> = {
    table: Table<T>;
    isLoading: boolean;
};

const OphTable = <T,>({ table, isLoading }: Props<T>) => {
    const { L } = useLocalisations();
    const pageRef = useRef<HTMLInputElement>();
    return (
        <div className="react-table">
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
                                            <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
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
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <td key={cell.id} style={{ width: cell.column.getSize() }} className="rt-td">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {isLoading && <Loader />}
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
        </div>
    );
};

export default OphTable;
