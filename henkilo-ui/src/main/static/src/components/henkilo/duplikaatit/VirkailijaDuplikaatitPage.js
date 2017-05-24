
import React from 'react';
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';

export default class VirkailijaDuplikaatitPage extends React.Component {

    static proptypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.object.isRequired,
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return <div className="wrapper">
            <h3>{L['DUPLIKAATIT_HEADER']}</h3>
            <HenkiloViewDuplikaatit {...this.props}></HenkiloViewDuplikaatit>
        </div>


    }

}