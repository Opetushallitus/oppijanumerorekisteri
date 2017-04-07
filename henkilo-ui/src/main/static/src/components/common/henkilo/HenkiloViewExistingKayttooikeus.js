import './HenkiloViewExpiredKayttooikeus.css'
import React from 'react'
import ReactDataGrid from 'react-data-grid'

class HenkiloViewExistingKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        kayttooikeus: React.PropTypes.shape({kayttooikeus: React.PropTypes.array.isRequired}).isRequired,
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.tableHeadings = [
            'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA',
            'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
            'HENKILO_KAYTTOOIKEUS_ALKUPVM',
            'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
            'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
            'HENKILO_KAYTTOOIKEUS_JATKOAIKA',
        ];
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <table>
                            <thead>
                            <tr>
                                {this.tableHeadings.map((heading, idx) => <th key={idx}>{this.L[heading]}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.props.kayttooikeus.kayttooikeus.map((kayttooikeus, idx) =>
                                    (kayttooikeus.tila !== 'SULJETTU'
                                            ? <tr key={idx}>
                                                <td>{kayttooikeus.organisaatioOid}</td>
                                                <td>{kayttooikeus.ryhmaNames.texts
                                                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text}</td>
                                                <td>{kayttooikeus.alkuPvm}</td>
                                                <td>{kayttooikeus.voimassaPvm}</td>
                                                <td>{kayttooikeus.kasitelty}/{kayttooikeus.kasittelijaOid}</td>
                                                <td>{}</td>
                                            </tr>
                                            : null
                                    )
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewExistingKayttooikeus;
