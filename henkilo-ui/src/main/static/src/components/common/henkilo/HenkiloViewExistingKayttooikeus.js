import './HenkiloViewExpiredKayttooikeus.css'
import React from 'react'
import Table from '../table/Table'

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

        this.createRows();
    };

    createRows() {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .map(kayttooikeus => ({
                [this.tableHeadings[0]]: kayttooikeus.organisaatioOid,
                [this.tableHeadings[1]]: kayttooikeus.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [this.tableHeadings[2]]: kayttooikeus.alkuPvm,
                [this.tableHeadings[3]]: kayttooikeus.voimassaPvm,
                [this.tableHeadings[4]]: kayttooikeus.kasitelty + '/' + kayttooikeus.kasittelijaOid,
                [this.tableHeadings[5]]: '',
            }));
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table headings={this.tableHeadings} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewExistingKayttooikeus;
