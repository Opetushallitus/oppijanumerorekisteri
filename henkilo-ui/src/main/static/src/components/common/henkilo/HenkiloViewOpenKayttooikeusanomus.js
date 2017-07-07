import './HenkiloViewOpenKayttooikeusanomus.css'
import React from 'react'
import Table from '../table/Table'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import StaticUtils from "../StaticUtils"
import MyonnaButton from "./buttons/MyonnaButton"
import HylkaaButton from "./buttons/HylkaaButton"
import Button from "../button/Button"
import { urls } from "oph-urls-js"
import { http } from "../../../http"
import {toLocalizedText} from '../../../localizabletext'

class HenkiloViewOpenKayttooikeusanomus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,

        updateHaettuKayttooikeusryhma: React.PropTypes.func.isRequired,
        isOmattiedot: React.PropTypes.bool,
        kayttooikeus: React.PropTypes.shape({
            kayttooikeusAnomus: React.PropTypes.array.isRequired,
            grantableKayttooikeus: React.PropTypes.object.isRequired,
        }),
        organisaatioCache: React.PropTypes.objectOf(React.PropTypes.shape({nimi: React.PropTypes.object.isRequired,})),
        isAnomusView: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [{key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU'},
            {key: 'HENKILO_KAYTTOOIKEUS_NIMI', hide: !this.props.isAnomusView, notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO', minWidth: 220, notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA', minWidth: 220, notSortable: this.props.isAnomusView,},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM', notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM', notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI', minWidth: 50, notSortable: this.props.isAnomusView},
            {key: 'EMPTY_PLACEHOLDER', minWidth: 150, notSortable: true,},
        ];
        this.tableHeadings = this.headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));


        this.updateHaettuKayttooikeusryhma = (id, tila, idx) => {
            this.props.updateHaettuKayttooikeusryhma(id, tila,
                this.state.dates[idx].alkupvm.format(this.L['PVM_DBFORMAATTI']),
                this.state.dates[idx].loppupvm.format(this.L['PVM_DBFORMAATTI']),
                this.props.oidHenkilo);
        };

        this.state = {
            dates: this.props.kayttooikeus.kayttooikeusAnomus.map(kayttooikeusAnomus => ({
                alkupvm: moment(),
                loppupvm: moment().add(1, 'years'),
            })),
        };
    };

    loppupvmAction(value, idx) {
        const dates = [...this.state.dates];
        dates[idx].loppupvm = value;
        this.setState({
            dates: dates,
        });
    };

    createRows() {
        const headingList = this.headingList.map(heading => heading.key);
        this._rows = this.props.kayttooikeus.kayttooikeusAnomus
            .map((haettuKayttooikeusRyhma, idx) => ({
                [headingList[0]]: moment(new Date(haettuKayttooikeusRyhma.anomus.anottuPvm)).format(),
                [headingList[1]]: haettuKayttooikeusRyhma.anomus.henkilo.etunimet + ' ' + haettuKayttooikeusRyhma.anomus.henkilo.sukunimi,
                [headingList[2]]: this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].nimi[this.props.locale]
                + ' ' + StaticUtils.getOrganisaatiotyypitFlat(this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].tyypit, this.L),
                [headingList[3]]: toLocalizedText(this.props.locale, haettuKayttooikeusRyhma.kayttoOikeusRyhma.description, haettuKayttooikeusRyhma.kayttoOikeusRyhma.name),
                [headingList[4]]: <span>{this.state.dates[idx].alkupvm.format()}</span>,
                [headingList[5]]: !this.props.isOmattiedot
                    ? <DatePicker className="oph-input"
                                  onChange={(value) => this.loppupvmAction(value, idx)}
                                  selected={this.state.dates[idx].loppupvm}
                                  showYearDropdown
                                  showWeekNumbers
                                  filterDate={(date) => date.isBefore(moment().add(1, 'years'))} />
                    : this.state.dates[idx].loppupvm.format(),
                [headingList[6]]: this.L[haettuKayttooikeusRyhma.anomus.anomusTyyppi],
                [headingList[7]]: this.props.isOmattiedot ? this.anomusHandlingButtonsForOmattiedot(haettuKayttooikeusRyhma, idx) : this.anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx),
            }));
    };

    anomusHandlingButtonsForOmattiedot (haettuKayttooikeusRyhma, idx) {
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <Button action={this.cancelAnomus.bind(this, haettuKayttooikeusRyhma, idx)}>{this.L['HENKILO_KAYTTOOIKEUSANOMUS_PERU']}</Button>
            </div>
        </div>
    };

    anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx) {
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <MyonnaButton myonnaAction={() => this.updateHaettuKayttooikeusryhma(haettuKayttooikeusRyhma.id,
                    'MYONNETTY', idx)}
                              L={this.L}
                              disabled={this.hasNoPermission(haettuKayttooikeusRyhma.anomus.organisaatioOid, haettuKayttooikeusRyhma.id)} />
            </div>
            <div style={{display: 'table-cell'}}>
                <HylkaaButton hylkaaAction={() => this.updateHaettuKayttooikeusryhma(
                    haettuKayttooikeusRyhma.id, 'HYLATTY', idx)}
                              L={this.L}
                              henkilo={this.props.henkilo}
                              disabled={this.hasNoPermission(haettuKayttooikeusRyhma.anomus.organisaatioOid, haettuKayttooikeusRyhma.id)} />
            </div>

        </div>
    };

    async cancelAnomus(haettuKayttooikeusRyhma, idx) {
        const url = urls.url('kayttooikeus-service.omattiedot.anomus.muokkaus');
        await http.put(url, haettuKayttooikeusRyhma.id);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);
    }

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    hasNoPermission(organisaatioOid, kayttooikeusryhmaId) {
        return !this.props.kayttooikeus.grantableKayttooikeusLoading
            && !(this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid]
            && this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid].indexOf(kayttooikeusryhmaId) === 0);
    };

    render() {
        this.createRows();
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table headings={this.tableHeadings}
                               data={this._rows}
                               noDataText={this.L['HENKILO_KAYTTOOIKEUS_AVOIN_TYHJA']} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewOpenKayttooikeusanomus;
