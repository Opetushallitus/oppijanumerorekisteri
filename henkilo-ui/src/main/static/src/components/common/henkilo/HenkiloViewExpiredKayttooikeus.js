import './HenkiloViewExistingKayttooikeus.css'
import React from 'react'
import Table from '../table/Table'
import dateformat from 'dateformat'

class HenkiloViewExpiredKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        organisaatioCache: React.PropTypes.objectOf(React.PropTypes.shape({nimi: React.PropTypes.object.isRequired,})),
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
                [headingList[0]]: this.props.organisaatioCache[kayttooikeus.organisaatioOid].nimi[this.props.locale],
                [headingList[1]]: kayttooikeus.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: this.L[kayttooikeus.tila],
                [headingList[3]]: dateformat(new Date(kayttooikeus.voimassaPvm), this.L['PVM_FORMAATTI']),
                [headingList[4]]: dateformat(kayttooikeus.kasitelty, this.L['PVM_FORMAATTI']) + ' / ' + kayttooikeus.kasittelijaNimi || kayttooikeus.kasittelijaOid,
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
                        <Table headings={this.tableHeadings}
                               data={this._rows}
                               noDataText={this.L['HENKILO_KAYTTOOIKEUS_SULKEUTUNEET_TYHJA']} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewExpiredKayttooikeus;
