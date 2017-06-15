import './HenkiloViewOpenKayttooikeusanomus.css'
import React from 'react'
import Table from '../table/Table'
import dateformat from 'dateformat'
import StaticUtils from "../StaticUtils";
import MyonnaButton from "./buttons/MyonnaButton";
import HylkaaButton from "./buttons/HylkaaButton";
import Button from "../button/Button";
import { urls } from "oph-urls-js";
import { http } from "../../../http";

class HenkiloViewOpenKayttooikeusanomus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,

        updateHaettuKayttooikeusryhma: React.PropTypes.func.isRequired,
        isOmattiedot: React.PropTypes.bool,
        kayttooikeus: React.PropTypes.shape({kayttooikeusAnomus: React.PropTypes.array.isRequired}),
        organisaatioCache: React.PropTypes.objectOf(React.PropTypes.shape({nimi: React.PropTypes.object.isRequired,})),
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [{key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU'},
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO', minWidth: 220,},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA', minWidth: 220,},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI', minWidth: 50,},
            {key: 'EMPTY_PLACEHOLDER', minWidth: 150, notSortable: true,},
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
                [headingList[1]]: this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].nimi[this.props.locale]
                + ' ('+ StaticUtils.flatArray(this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].tyypit) + ')',
                [headingList[2]]: haettuKayttooikeusRyhma.kayttoOikeusRyhma.description.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[3]]: <span>{dateformat(this.dates[idx].alkupvm, this.L['PVM_FORMAATTI'])}</span>,
                [headingList[4]]: <input className="oph-input" defaultValue={dateformat(this.dates[idx].loppupvm, this.L['PVM_FORMAATTI'])}
                                         onChange={(event) => {this.dates[idx].loppupvm =
                                             StaticUtils.ddmmyyyyToDate(event.target.value);}} />,
                [headingList[5]]: this.L[haettuKayttooikeusRyhma.anomus.anomusTyyppi],
                [headingList[6]]: this.props.isOmattiedot ? this.anomusHandlingButtonsForOmattiedot(haettuKayttooikeusRyhma, idx) : this.anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx),
            }));
    };

    anomusHandlingButtonsForOmattiedot (haettuKayttooikeusRyhma, idx) {
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <Button action={this.cancelAnomus.bind(this, haettuKayttooikeusRyhma, idx)}>{this.L['HENKILO_KAYTTOOIKEUSANOMUS_PERU']}</Button>
            </div>
        </div>
    }

    anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx) {
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <MyonnaButton myonnaAction={() => this.updateHaettuKayttooikeusryhma(haettuKayttooikeusRyhma.id,
                    'MYONNETTY', idx)} L={this.L}/>
            </div>
            <div style={{display: 'table-cell'}}>
                <HylkaaButton hylkaaAction={() => this.updateHaettuKayttooikeusryhma(
                    haettuKayttooikeusRyhma.id, 'HYLATTY', idx)} L={this.L} henkilo={this.props.henkilo} />
            </div>

        </div>
    }

    async cancelAnomus(haettuKayttooikeusRyhma, idx) {
        const url = urls.url('kayttooikeus-service.omattiedot.anomus.muokkaus');
        await http.put(url, haettuKayttooikeusRyhma.id);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);
    }

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table headings={this.tableHeadings}
                               data={this.createRows()}
                               noDataText={this.L['HENKILO_KAYTTOOIKEUS_AVOIN_TYHJA']} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewOpenKayttooikeusanomus;
