import React from 'react';
import Loader from './Loader';

type Props = {
    loading: boolean;
};

/**
 * Loading-komponentti react-table -komponentille.
 *
 * Käyttö:
 *
 * import ReactTable from 'react-table'
 * import TableLoader from 'common/icons/TableLoader'
 * <ReactTable ...
 *             loading={this.state.loading}
 *             LoadingComponent={TableLoader}>
 * </ReactTable>
 */
class TableLoader extends React.Component<Props> {
    render() {
        return <div>{this.props.loading && <Loader />}</div>;
    }
}

export default TableLoader;
