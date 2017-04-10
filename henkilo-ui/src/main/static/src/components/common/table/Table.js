import './Table.css'
import React from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class Table extends React.Component {
    static propTypes = {
        headings: React.PropTypes.array.isRequired,
    };
    constructor(props) {
        super(props);

        this.tableHeadings = this.props.headings;
        this.headingDirections = [false];
    }
    render() {
        return (
            <div>
                <ReactTable className="table"
                            showPagination={false}
                            resizable={false}
                            defaultPageSize={this.tableHeadings.length}
                            loadingText=""
                            // onChange={this.onSort}
                            data={this.tableHeadings.map(heading => ({heading}))}
                            columns={[{getHeaderProps: (state, rowInfo, column) => {
                                console.log(state.sorting);
                                const sorting = state.sorting && state.sorting.length
                                    ? state.sorting.filter(sorting => {
                                        return column.id === sorting.id;
                                    })[0]
                                    : undefined;
                                column.sorting = {desc: sorting && sorting.desc};
                                return {
                                };
                            },
                                header: props => {
                                    return (<span>Heading {props.column.sorting.desc !== undefined ? (props.column.sorting.desc ? '∧' : '∨') : ''}</span>)
                                },
                                accessor: 'heading',
                                sortable: true,
                            }
                            ]} />
            </div>
        );
    };

    // onSort(state, instance) {
    //     console.log(state.sorting);
    //     console.log(instance);
    //     state.headingDirections = state.headingDirections || [false];
    //     state.headingDirections = state.headingDirections.map((heading, idx) => {
    //         return state.sorting[idx].desc;
    //     });
    // }
}

export default Table;