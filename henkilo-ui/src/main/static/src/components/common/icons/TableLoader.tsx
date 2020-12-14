import React from "react"
import PropTypes from "prop-types"
import Loader from "./Loader"

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
class TableLoader extends React.Component {
    render() {
        return <div>{this.props.loading && <Loader />}</div>
    }
}

TableLoader.propTypes = {
    loading: PropTypes.bool.isRequired,
}

export default TableLoader