import React from 'react';
import PropTypes from 'prop-types';

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
        return (
            <div>
                {this.props.loading &&
                <div className="oph-spinner">
                    <div className="oph-bounce oph-bounce1" />
                    <div className="oph-bounce oph-bounce2" />
                    <div className="oph-bounce oph-bounce3" />
                </div>
                }
            </div>
        );
    }

};

TableLoader.propTypes = {
    loading: PropTypes.bool.isRequired,
};

export default TableLoader;
