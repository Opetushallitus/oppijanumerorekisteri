import './HenkiloViewOpenKayttooikeusanomus.css'
import React from 'react'
import Table from '../table/Table'
import dateformat from 'dateformat'
import StaticUtils from "../StaticUtils";

class HenkiloViewOpenKayttooikeusanomus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,

        myonnaButton: React.PropTypes.func.isRequired,
        hylkaaButton: React.PropTypes.func.isRequired,
        updateHaettuKayttooikeusryhma: React.PropTypes.func.isRequired,

        kayttooikeus: React.PropTypes.shape({kayttooikeusAnomus: React.PropTypes.array.isRequired}),
        organisaatioCache: React.PropTypes.objectOf(React.PropTypes.shape({nimi: React.PropTypes.object.isRequired,})),
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [{key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU'},
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO'},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA'},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI'},
            {key: 'EMPTY_PLACEHOLDER', minWidth: 200},
        ];
        this.tableHeadings = this.headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));

        this.dates = this.props.kayttooikeus.kayttooikeusAnomus.map(kayttooikeusAnomus => ({
            alkupvm: Date.now(),
            loppupvm: StaticUtils.datePlusOneYear(Date.now())
        }));

        this.updateHaettuKayttooikeusryhma = (id, tila, idx) => {
            this.props.updateHaettuKayttooikeusryhma(id, tila,
                dateformat(this.dates[idx].alkupvm, this.L['PVM_DBFORMAATTI']),
                dateformat(this.dates[idx].loppupvm, this.L['PVM_DBFORMAATTI']),
                this.props.oidHenkilo);
        };
    };

    createRows() {
        const headingList = this.headingList.map(heading => heading.key);
        return this.props.kayttooikeus.kayttooikeusAnomus
            .map((haettuKayttooikeusRyhma, idx) => ({
                [headingList[0]]: dateformat(new Date(haettuKayttooikeusRyhma.anomus.anottuPvm), this.L['PVM_FORMAATTI']),
                [headingList[1]]: this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].nimi[this.props.locale],
                [headingList[2]]: haettuKayttooikeusRyhma.kayttoOikeusRyhma.description.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[3]]: <span>{dateformat(this.dates[idx].alkupvm, this.L['PVM_FORMAATTI'])}</span>,
                [headingList[4]]: <input className="oph-input" defaultValue={dateformat(this.dates[idx].loppupvm, this.L['PVM_FORMAATTI'])}
                                         onChange={(event) => {this.dates[idx].loppupvm =
                                             StaticUtils.ddmmyyyyToDate(event.target.value);}} />,
                [headingList[5]]: this.L[haettuKayttooikeusRyhma.anomus.anomusTyyppi],
                [headingList[6]]: <div>
                    <div style={{display: 'table-cell', paddingRight: '10px'}}>
                        {this.props.myonnaButton(() => {this.updateHaettuKayttooikeusryhma(haettuKayttooikeusRyhma.id,
                            'MYONNETTY', idx)})}
                    </div>
                    <div style={{display: 'table-cell'}}>
                        {this.props.hylkaaButton(() => {this.props.myonnaButton(() => {this.updateHaettuKayttooikeusryhma(
                            haettuKayttooikeusRyhma.id, 'HYLATTY', idx)})})}
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
                        <Table headings={this.tableHeadings} data={this.createRows()} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewOpenKayttooikeusanomus;
