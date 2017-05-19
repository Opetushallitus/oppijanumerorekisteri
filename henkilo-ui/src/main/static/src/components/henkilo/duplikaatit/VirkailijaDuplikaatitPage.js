
import React from 'react';

export default class VirkailijaDuplikaatitPage extends React.Component {

    static proptypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.object.isRequired,

    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return <h3>{L['DUPLIKAATIT_HEADER']}</h3>
    }

}