import './HenkiloViewCreateKayttooikeus.css'
import React from 'react'

class HenkiloViewCreateKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewCreateKayttooikeus;
