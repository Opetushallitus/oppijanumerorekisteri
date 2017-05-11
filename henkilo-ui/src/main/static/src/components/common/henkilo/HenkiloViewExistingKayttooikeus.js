import './HenkiloViewExpiredKayttooikeus.css'
import React from 'react'
import Table from '../table/Table'
import dateformat from 'dateformat'
import StaticUtils from "../StaticUtils";
import MyonnaButton from "./buttons/MyonnaButton";

class HenkiloViewExistingKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        kayttooikeus: React.PropTypes.shape({kayttooikeus: React.PropTypes.array.isRequired}).isRequired,
        organisaatioCache: React.PropTypes.objectOf(React.PropTypes.shape({nimi: React.PropTypes.object.isRequired,})),
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [{key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA', minWidth: 200},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS', minWidth: 150},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM', maxWidth: 120},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM', maxWidth: 120},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 125},
            {key: 'HENKILO_KAYTTOOIKEUS_JATKOAIKA'},
        ];
        this.tableHeadings = this.headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));

        this.dates = this.props.kayttooikeus.kayttooikeus
            .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
            .map(kayttooikeusAnomus => ({
                alkupvm: Date.now(),
                loppupvm: StaticUtils.datePlusOneYear(Date.now())
            }));

        this.updateKayttooikeusryhma = (id, kayttooikeudenTila, idx, organisaatioOid) => {
            this.props.addKayttooikeusToHenkilo(this.props.oidHenkilo, organisaatioOid, [{
                id,
                kayttooikeudenTila,
                alkupvm: dateformat(this.dates[idx].alkupvm, this.L['PVM_DBFORMAATTI']),
                loppupvm: dateformat(this.dates[idx].loppupvm, this.L['PVM_DBFORMAATTI']),
            }]);
        };

        this.createRows(this.headingList.map(heading => heading.key));
    };

    createRows(headingList) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
            .map((uusittavaKayttooikeusRyhma, idx) => ({
                [headingList[0]]: this.props.organisaatioCache[uusittavaKayttooikeusRyhma.organisaatioOid].nimi[this.props.locale],
                [headingList[1]]: uusittavaKayttooikeusRyhma.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: dateformat(new Date(uusittavaKayttooikeusRyhma.alkuPvm), this.L['PVM_FORMAATTI']),
                [headingList[3]]: dateformat(new Date(uusittavaKayttooikeusRyhma.voimassaPvm), this.L['PVM_FORMAATTI']),
                [headingList[4]]: dateformat(uusittavaKayttooikeusRyhma.kasitelty, this.L['PVM_FORMAATTI']) + ' / '
                + uusittavaKayttooikeusRyhma.kasittelijaNimi || uusittavaKayttooikeusRyhma.kasittelijaOid,
                [headingList[5]]: <div>
                    <div style={{display: 'table-cell', paddingRight: '10px'}}>
                        <input className="oph-input" defaultValue={dateformat(this.dates[idx].loppupvm, this.L['PVM_FORMAATTI'])}
                               onChange={(event) => {this.dates[idx].loppupvm =
                                   StaticUtils.ddmmyyyyToDate(event.target.value);}} />
                    </div>
                    <div style={{display: 'table-cell'}}>
                        <MyonnaButton myonnaAction={() => this.updateKayttooikeusryhma(uusittavaKayttooikeusRyhma.ryhmaId, 'MYONNETTY', idx,
                            uusittavaKayttooikeusRyhma.organisaatioOid)} henkilo={this.props.henkilo} L={this.L}/>
                    </div>
                </div>,
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
                        <Table headings={this.tableHeadings} data={this._rows} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewExistingKayttooikeus;
