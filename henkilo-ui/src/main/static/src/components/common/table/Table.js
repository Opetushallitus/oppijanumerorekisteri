import './Table.css'
import React from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import SortAscIcon from "../icons/SortAscIcon";
import SortDescIcon from "../icons/SortDescIcon";
import SortIconNone from "../icons/SortIconNone";

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
                React.PropTypes.object
            ]).isRequired)),
    };

    render() {
        return (
            <div>
                <ReactTable className="table"
                            showPagination={false}
                            resizable={true}
                            pageSize={this.props.data.length}
                            loadingText=""
                            noDataText=""
                            data={this.props.data}
                            columns={
                                this.props.headings.map(heading => ({
                                    getHeaderProps: this.getHeaderProps,
                                    header: props => {
                                        return (<span className="oph-bold">
                                            {heading.label} {props.column.sorting.desc !== undefined
                                            ? (props.column.sorting.desc ? <SortAscIcon/> : <SortDescIcon/>)
                                            : <SortIconNone/>}
                                        </span>)
                                    },
                                    accessor: heading.key,
                                    sortable: true,
                                    maxWidth: heading.maxWidth || undefined,
                                    minWidth: heading.minWidth || 100,
                                }))
                            } />
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