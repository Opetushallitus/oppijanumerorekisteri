import './Table.css'
import React from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import SortAscIcon from "../icons/SortAscIcon";
import SortDescIcon from "../icons/SortDescIcon";
import SortIconNone from "../icons/SortIconNone";
import classNames from 'classnames/bind';

class Table extends React.Component {
    static propTypes = {
        headings: React.PropTypes.arrayOf(React.PropTypes.shape({
            key: React.PropTypes.string.isRequired,
            label: React.PropTypes.string.isRequired,
            maxWidth: React.PropTypes.number,
            minWidth: React.PropTypes.number,
        }).isRequired).isRequired,
        data: React.PropTypes.arrayOf(React.PropTypes.objectOf(
            React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.object,
                React.PropTypes.bool,
            ]).isRequired)).isRequired,
        noDataText: React.PropTypes.string.isRequired,
        striped: React.PropTypes.bool,
        highlight: React.PropTypes.bool,
        getTdProps: React.PropTypes.func,
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
                            pageSize={this.props.data.length}
                            loadingText=""
                            noDataText={this.props.noDataText || ''}
                            data={this.props.data}
                            columns={
                                this.props.headings.map(heading => ({
                                    getHeaderProps: this.getHeaderProps,
                                    Header: props => {
                                        return (<span className="oph-bold">
                                            {heading.label} {!heading.notSortable ? props.column.sorting.desc !== undefined
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
                            getTrProps={(state, rowInfo, column) => {
                                return {
                                    className: rowInfo.row.HIGHLIGHT ? "fadeOutBackgroundColor" : null,
                                }}}
                            getTdProps={this.props.getTdProps} />
            </div>
        );
    };

    getHeaderProps(state, rowInfo, column) {
        const sorting = state.sorting && state.sorting.length
            ? state.sorting.filter(sorting => {
                return column.id === sorting.id;
            })[0]
            : undefined;
        column.sorting = {desc: sorting && sorting.desc};
        return {};
    };

}

export default Table;