import React from 'react';
import PropTypes from 'prop-types';

const YKSILOINTI_TILAT = {
    OK: <i className="fa fa-check oph-green" aria-hidden="true" />,
    VIRHE: <i className="fa fa-exclamation-circle oph-red" aria-hidden="true" />,
    KESKEN: <i className="fa fa-check oph-yellow" aria-hidden="true" />,
    HETU_PUUTTUU: <i className="fa fa-exclamation-circle oph-red" aria-hidden="true" />,
};

class YksilointiTilaIkoni extends React.Component {

    render() {
        return YKSILOINTI_TILAT[this.props.value] || <i className="fa" aria-hidden="true" />;
    }

};

YksilointiTilaIkoni.propTypes = {
    value: PropTypes.string.isRequired,
};

export default YksilointiTilaIkoni;
