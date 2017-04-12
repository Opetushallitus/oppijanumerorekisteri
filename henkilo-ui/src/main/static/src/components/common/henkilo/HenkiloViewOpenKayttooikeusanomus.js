import './HenkiloViewOpenKayttooikeusanomus.css'
import React from 'react'
import Table from '../table/Table'
import dateformat from 'dateformat'

class HenkiloViewOpenKayttooikeusanomus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,

        myonnaButton: React.PropTypes.func.isRequired,
        hylkaaButton: React.PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        const headingList = [{key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU'},
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO'},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA'},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI'},
            {key: 'EMPTY_PLACEHOLDER', minWidth: 200},
        ];
        this.tableHeadings = headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));

        this.createRows(headingList.map(heading => heading.key));


        this.myonna = (kayttooikeusAnomus) => {};

        this.hylkaa = (kayttooikeusAnomus) => {};
    };

    createRows(headingList) {
        this._rows = this.props.kayttooikeus.kayttooikeusAnomus
            .map(kayttooikeusAnomus => ({
                [headingList[0]]: dateformat(new Date(kayttooikeusAnomus.anomus.anottuPvm), this.L['PVM_FORMAATTI']),
                [headingList[1]]: kayttooikeusAnomus.anomus.organisaatioOid,
                [headingList[2]]: kayttooikeusAnomus.kayttoOikeusRyhma.description.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[3]]: dateformat(Date.now(), this.L['PVM_FORMAATTI']),
                [headingList[4]]: dateformat(Date.now(), this.L['PVM_FORMAATTI']),
                [headingList[5]]: this.L[kayttooikeusAnomus.anomus.anomusTyyppi],
                [headingList[6]]: <div>
                    <div style={{display: 'table-cell', paddingRight: '10px'}}>
                        {this.props.myonnaButton((kayttooikeusAnomus) => {})}
                    </div>
                    <div style={{display: 'table-cell'}}>
                        {this.props.hylkaaButton((kayttooikeusAnomus) => {})}
                    </div>
                </div>,
            }));
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table headings={this.tableHeadings} data={this._rows} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewOpenKayttooikeusanomus;
