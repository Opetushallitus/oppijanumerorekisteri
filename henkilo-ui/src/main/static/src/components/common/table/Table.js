// @flow

import './Table.css'
import * as React from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import SortAscIcon from "../icons/SortAscIcon";
import SortDescIcon from "../icons/SortDescIcon";
import SortIconNone from "../icons/SortIconNone";
import classNames from 'classnames/bind';
import Loader from "../icons/Loader";

type Heading = {
    key: string,
    label?: string,
    maxWidth?: number,
    minWidth?: number,
    notSortable?: boolean,
    hide?: boolean
}

type Props = {
    headings: Array<Heading>,
    data: Array<string | number | boolean>,
    noDataText: string,
    striped?: boolean,
    highlight?: boolean,
    manual?: boolean,
    onFetchData: (any) => void,
    getTdProps?: () => void,
    subComponent?: (any) => React.Node,
    defaultSorted: Array<any>,
    fetchMoreSettings: {
        fetchMoreAction: () => void,
        isActive: boolean
    },
    isLoading: boolean
};

class Table extends React.Component<Props> {

    static defaultProps = {
        fetchMoreSettings: {},
    };

    render() {
        const classname = classNames({
            table: true,
            "-striped": this.props.striped,
            "-highlight": this.props.highlight,
        });
        return (
            <div>
                <ReactTable className={classname}
                            showPagination={false}
                            resizable={false}
                            manual={this.props.manual}
                            pageSize={this.props.data.length}
                            defaultSorted={this.props.defaultSorted || []}
                            loadingText=""
                            noDataText={this.props.noDataText || ''}
                            data={this.props.data}
                            SubComponent={this.props.subComponent}
                            freezeWhenExpanded={this.props.subComponent ? true : false}
                            columns={
                                this.props.headings.map(heading => ({
                                    getHeaderProps: this.getHeaderProps,
                                    Header: props => {
                                        return (<span className="oph-bold">
                                            {heading.label} {props.column.sortable ? props.column.sorting.desc !== undefined
                                            ? (props.column.sorting.desc ? <SortAscIcon/> : <SortDescIcon/>)
                                            : <SortIconNone/>
                                            : null}
                                        </span>)
                                    },
                                    accessor: heading.key,
                                    sortable: !heading.notSortable,
                                    maxWidth: heading.maxWidth || undefined,
                                    minWidth: heading.minWidth || 100,
                                    show: !heading.hide,
                                }))
                            }
                            getTrProps={(state, rowInfo, column) => ({ className: rowInfo.row.HIGHLIGHT ? "fadeOutBackgroundColor" : null })}
                            getTdProps={this.props.getTdProps}
                            onFetchData={this.props.onFetchData} />
                <VisibilitySensor onChange={(isVisible) => { if(isVisible) {this.props.fetchMoreSettings.fetchMoreAction && this.props.fetchMoreSettings.fetchMoreAction();} }}
                                  active={this.props.fetchMoreSettings.isActive}
                                  resizeDelay={500}
                                  delayedCall
                                  partialVisibility>
                    {({isVisible}) =>
                        <div style={{visibility: "hidden"}}>invisible</div>
                    }
                </VisibilitySensor>
                { this.props.isLoading ? <Loader /> : null }
            </div>
        );
    };

    getHeaderProps(state: any, rowInfo: any, column: any) {
        const sorting = state.sorted && state.sorted.length
            ? state.sorted.filter(sorting => column.id === sorting.id)[0]
            : undefined;
        column.sorting = {desc: sorting && sorting.desc};
        return {};
    };

}

export default Table;