import React from 'react';
import PropTypes from 'prop-types'
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';
import Loader from "../../common/icons/Loader";

export default class DuplikaatitPage extends React.Component {

    static proptypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.object.isRequired,
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return <div className="wrapper">
            <span className="oph-h3 oph-strong">{L['DUPLIKAATIT_HEADER']}, {this.props.henkilo.henkilo.kutsumanimi} {this.props.henkilo.henkilo.sukunimi}</span>
            {!this.props.henkilo.henkiloLoading ? <HenkiloViewDuplikaatit {...this.props} /> : <Loader />}
        </div>
    }

}
