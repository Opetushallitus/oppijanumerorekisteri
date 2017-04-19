import './HenkiloViewExistingKayttooikeus.css'
import React from 'react'
import Table from '../table/Table'
import dateformat from 'dateformat'

class HenkiloViewExpiredKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        const headingList = [{key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO'},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'},
            {key: 'HENKILO_KAYTTOOIKEUS_TILA'},
            {key: 'HENKILO_KAYTTOOIKEUS_SULJETTU'},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 150},
        ];
        this.tableHeadings = headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));

        this.createRows(headingList.map(heading => heading.key));
    };

    createRows(headingList) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(kayttooikeus => kayttooikeus.tila === 'SULJETTU').map(kayttooikeus => ({
                [headingList[0]]: kayttooikeus.organisaatioOid,
                [headingList[1]]: kayttooikeus.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: this.L[kayttooikeus.tila],
                [headingList[3]]: dateformat(new Date(kayttooikeus.voimassaPvm), this.L['PVM_FORMAATTI']),
                [headingList[4]]: kayttooikeus.kasitelty + '/' + kayttooikeus.kasittelijaOid,
            }));
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table headings={this.tableHeadings} data={this._rows} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewExpiredKayttooikeus;
