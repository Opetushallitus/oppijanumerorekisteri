import './Table.css'
import React from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import SortAscIcon from "../icons/SortAscIcon";
import SortDescIcon from "../icons/SortDescIcon";
import SortIconNone from "../icons/SortIconNone";
import classNames from 'classnames/bind';
import Loader from "../icons/Loader";

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
        manual: React.PropTypes.bool,
        onFetchData: React.PropTypes.func,
        getTdProps: React.PropTypes.func,
        defaultSorted: React.PropTypes.array,

        fetchMoreSettings: React.PropTypes.shape({
            fetchMoreAction: React.PropTypes.func,
            isActive: React.PropTypes.bool,
        }),
        isLoading: React.PropTypes.bool,
    };

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
                            getTrProps={(state, rowInfo, column) => {
                                return {
                                    className: rowInfo.row.HIGHLIGHT ? "fadeOutBackgroundColor" : null,
                                }}}
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

    getHeaderProps(state, rowInfo, column) {
        const sorting = state.sorted && state.sorted.length
            ? state.sorted.filter(sorting => column.id === sorting.id)[0]
            : undefined;
        column.sorting = {desc: sorting && sorting.desc};
        return {};
    };

}

export default Table;