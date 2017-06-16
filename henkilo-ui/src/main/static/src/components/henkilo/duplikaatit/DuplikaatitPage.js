
import React from 'react';
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';

export default class DuplikaatitPage extends React.Component {

    static proptypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.object.isRequired,
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        console.log(this.props);
        return <div className="wrapper">
            <h3>{L['DUPLIKAATIT_HEADER']}, {this.props.henkilo.henkilo.kutsumanimi} {this.props.henkilo.henkilo.sukunimi}</h3>
            <HenkiloViewDuplikaatit {...this.props}></HenkiloViewDuplikaatit>
        </div>


    }

}