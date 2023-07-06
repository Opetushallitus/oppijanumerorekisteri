import './Table.css';
import * as React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import SortAscIcon from '../icons/SortAscIcon';
import SortDescIcon from '../icons/SortDescIcon';
import SortIconNone from '../icons/SortIconNone';
import classNames from 'classnames/bind';
import Loader from '../icons/Loader';
import { TableHeading } from '../../../types/react-table.types';

type Props = {
    headings: Array<TableHeading>;
    data: Array<any>;
    noDataText?: string;
    striped?: boolean;
    highlight?: boolean;
    manual?: boolean;
    resizable?: boolean;
    onFetchData?: (arg0: any) => void;
    getTdProps?: (cellInfo: any) => any;
    subComponent?: (arg0: any) => React.ReactNode;
    defaultSorted?: Array<any>;
    fetchMoreSettings?: {
        fetchMoreAction?: () => void;
        isActive?: boolean;
    };
    isLoading?: boolean;
    pageSize?: number;
    translate?: (key: string) => string;
    column?: object;
};

const getHeaderProps = (state: any, _rowInfo: any, column: any) => {
    const sorting =
        state.sorted && state.sorted.length ? state.sorted.filter((sorting) => column.id === sorting.id)[0] : undefined;
    column.sorting = { desc: sorting && sorting.desc };
    return {};
};

const Table: React.FC<Props> = ({
    fetchMoreSettings = {},
    resizable = false,
    translate = (key: string) => key,
    ...props
}) => {
    const [pageSize, setPageSize] = React.useState<number>(0);

    React.useEffect(() => {
        setPageSize(Math.min(...[props.pageSize, props.data.length].filter((x) => x !== undefined)));
    }, [props.pageSize, props.data]);

    const classname = classNames({
        table: true,
        '-striped': props.striped,
        '-highlight': props.highlight,
    });
    return (
        <div>
            <ReactTable
                onPageSizeChange={setPageSize}
                className={classname}
                showPagination={props.data.length > props.pageSize}
                resizable={resizable}
                manual={props.manual}
                pageSize={pageSize}
                defaultSorted={props.defaultSorted || []}
                loadingText=""
                noDataText={props.noDataText || ''}
                data={props.data}
                SubComponent={props.subComponent}
                freezeWhenExpanded={props.subComponent ? true : false}
                columns={props.headings.map((heading) => ({
                    getHeaderProps: getHeaderProps,
                    Header: (props) => {
                        return (
                            <span className="oph-bold">
                                {heading.label}{' '}
                                {props.column.sortable ? (
                                    props.column.sorting.desc !== undefined ? (
                                        props.column.sorting.desc ? (
                                            <SortAscIcon />
                                        ) : (
                                            <SortDescIcon />
                                        )
                                    ) : (
                                        <SortIconNone />
                                    )
                                ) : null}
                            </span>
                        );
                    },
                    Cell: heading.Cell,
                    accessor: heading.key,
                    sortable: !heading.notSortable,
                    maxWidth: heading.maxWidth || undefined,
                    minWidth: heading.minWidth || 100,
                    sortMethod: heading.sortMethod,
                    show: !heading.hide,
                }))}
                getTrProps={(_state, rowInfo, _column) => ({
                    className: rowInfo?.row.HIGHLIGHT ? 'fadeOutBackgroundColor' : null,
                })}
                getTdProps={props.getTdProps}
                onFetchData={props.onFetchData}
                previousText={translate('TAULUKKO_EDELLINEN')}
                nextText={translate('TAULUKKO_SEURAAVA')}
                pageText={translate('TAULUKKO_SIVU')}
                ofText="/"
                rowsText={translate('TAULUKKO_RIVIA')}
            />
            <VisibilitySensor
                onChange={(isVisible) => {
                    if (isVisible) {
                        fetchMoreSettings && fetchMoreSettings.fetchMoreAction && fetchMoreSettings.fetchMoreAction();
                    }
                }}
                active={fetchMoreSettings && fetchMoreSettings.isActive}
                resizeDelay={500}
                delayedCall
                partialVisibility
            >
                {() => <div style={{ visibility: 'hidden' }}>invisible</div>}
            </VisibilitySensor>
            {props.isLoading ? <Loader /> : null}
        </div>
    );
};

export default Table;
