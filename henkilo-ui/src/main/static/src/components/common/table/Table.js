import './Table.css'
import React from 'react'
import PropTypes from 'prop-types'
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
        headings: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            maxWidth: PropTypes.number,
            minWidth: PropTypes.number,
        }).isRequired).isRequired,
        data: PropTypes.arrayOf(PropTypes.objectOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
                PropTypes.bool,
            ]).isRequired)).isRequired,
        noDataText: PropTypes.string.isRequired,
        striped: PropTypes.bool,
        highlight: PropTypes.bool,
        manual: PropTypes.bool,
        onFetchData: PropTypes.func,
        getTdProps: PropTypes.func,
        defaultSorted: PropTypes.array,

        fetchMoreSettings: PropTypes.shape({
            fetchMoreAction: PropTypes.func,
            isActive: PropTypes.bool,
        }),
        isLoading: PropTypes.bool,
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