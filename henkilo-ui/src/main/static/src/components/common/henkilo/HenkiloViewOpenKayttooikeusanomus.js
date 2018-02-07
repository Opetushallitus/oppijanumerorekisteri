// @flow

import './HenkiloViewOpenKayttooikeusanomus.css';
import React from 'react';
import Table from '../table/Table';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import StaticUtils from '../StaticUtils';
import MyonnaButton from './buttons/MyonnaButton';
import Button from '../button/Button';
import { urls } from 'oph-urls-js';
import { http } from '../../../http';
import {toLocalizedText} from '../../../localizabletext'
import PopupButton from "../button/PopupButton";
import AnomusHylkaysPopup from '../../anomus/AnomusHylkaysPopup';
import PropertySingleton from '../../../globals/PropertySingleton';
import type {L, L10n} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";
import type {HaettuKayttooikeusryhma} from "../../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types";

type Heading = {
    key: string,
    label?: string,
    maxWidth?: number,
    minWidth?: number,
    notSortable?: boolean,
    hide?: boolean
}

type State = {
    dates: Array<{alkupvm: any, loppupvm: any}>
}

type Props = {
    l10n: L10n,
    locale: Locale,
    updateHaettuKayttooikeusryhma: (number, string, string, string, any, ?string) => Promise<any>,
    isOmattiedot?: boolean,
    kayttooikeus?: {
        kayttooikeusAnomus: Array<any>,
        grantableKayttooikeus: any,
        grantableKayttooikeusLoading: boolean
    },
    organisaatioCache: {
        nimi: string
    },
    isAnomusView?: boolean,
    manualSortSettings?: {
        manual: boolean,
        defaultSorted: Array<any>,
        onFetchData: (any) => void
    },
    fetchMoreSettings?: any,
    tableLoading?: boolean,
    striped?: boolean,
    fetchAllKayttooikeusAnomusForHenkilo?: (string) => void
}

class HenkiloViewOpenKayttooikeusanomus extends React.Component<Props, State> {

    L: L;
    headingList: Array<Heading>;
    tableHeadings: Array<Heading>;
    _rows: Array<any>;

    constructor(props: Props) {
        super(props);
        console.log(props);
        this.L = this.props.l10n[this.props.locale];
        this.headingList = [{key: 'ANOTTU_PVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_NIMI', hide: !this.props.isAnomusView, notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO', minWidth: 220, notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA', minWidth: 220, notSortable: this.props.isAnomusView,},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU', minWidth: 70, notSortable: true,},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM', notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM', notSortable: this.props.isAnomusView},
            {key: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI', minWidth: 50, notSortable: this.props.isAnomusView},
            {key: 'EMPTY_PLACEHOLDER', minWidth: 165, notSortable: true,},
        ];
        this.tableHeadings = this.headingList.map(heading => ({ ...heading, label: this.L[heading.key]}));

        this.state = {
            dates: this._getKayttooikeusAnomukset(this.props).map(kayttooikeusAnomus => ({
                alkupvm: moment(),
                loppupvm: moment().add(1, 'years'),
            })),
        };
    };

    _getKayttooikeusAnomukset = (props: Props): Array<any> => {
        return (props.kayttooikeus && props.kayttooikeus.kayttooikeusAnomus) ? props.kayttooikeus.kayttooikeusAnomus : [];
    };

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            dates: this._getKayttooikeusAnomukset(nextProps).map(kayttooikeusAnomus => ({
                alkupvm: moment(),
                loppupvm: moment().add(1, 'years'),
            })),
        });
    };

    loppupvmAction(value: any, idx: number) {
        const dates = [...this.state.dates];
        dates[idx].loppupvm = value;
        this.setState({
            dates: dates,
        });
    };

    createRows() {
        const headingList = this.headingList.map(heading => heading.key);
        this._rows = this._getKayttooikeusAnomukset(this.props)
            .map((haettuKayttooikeusRyhma, idx) => ({
                [headingList[0]]: moment(new Date(haettuKayttooikeusRyhma.anomus.anottuPvm)).format(),
                [headingList[1]]: haettuKayttooikeusRyhma.anomus.henkilo.etunimet + ' ' + haettuKayttooikeusRyhma.anomus.henkilo.sukunimi,
                [headingList[2]]: toLocalizedText(this.props.locale, this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].nimi)
                + ' ' + StaticUtils.getOrganisaatiotyypitFlat(this.props.organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].tyypit, this.L),
                [headingList[3]]: toLocalizedText(this.props.locale, haettuKayttooikeusRyhma.kayttoOikeusRyhma.description,
                    haettuKayttooikeusRyhma.kayttoOikeusRyhma.name),
                [headingList[4]]: this.createSelitePopupButton(haettuKayttooikeusRyhma.anomus.perustelut),
                [headingList[5]]: <span>{this.state.dates[idx].alkupvm.format()}</span>,
                [headingList[6]]: !this.props.isOmattiedot
                    ? <DatePicker className="oph-input"
                                  onChange={(value) => this.loppupvmAction(value, idx)}
                                  selected={this.state.dates[idx].loppupvm}
                                  showYearDropdown
                                  showWeekNumbers
                                  filterDate={(date) => date.isBefore(moment().add(1, 'years'))} />
                    : this.state.dates[idx].loppupvm.format(),
                [headingList[7]]: this.L[haettuKayttooikeusRyhma.anomus.anomusTyyppi],
                [headingList[8]]: this.props.isOmattiedot
                    ? this.anomusHandlingButtonsForOmattiedot(haettuKayttooikeusRyhma, idx)
                    : this.anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx),
            }));
    };

    createSelitePopupButton(perustelut: string) {
        return <PopupButton
            popupClass={'oph-popup-default oph-popup-bottom'}
            popupButtonWrapperPositioning={'absolute'}
            popupArrowStyles={{marginLeft: '10px'}}
            popupButtonClasses={'oph-button oph-button-ghost'}
            popupStyle={{left: '-20px', width: '20rem', padding: '30px', position: 'absolute'}}
            simple={true}
            disabled={!perustelut}
            popupContent={<p>{perustelut}</p>}>{this.L['AVAA']}</PopupButton>
    }

    anomusHandlingButtonsForOmattiedot (haettuKayttooikeusRyhma: HaettuKayttooikeusryhma, idx: number) {
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <Button action={this.cancelAnomus.bind(this, haettuKayttooikeusRyhma, idx)}>{this.L['HENKILO_KAYTTOOIKEUSANOMUS_PERU']}</Button>
            </div>
        </div>
    };

    anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma, idx: number) {
        const noPermission = this.hasNoPermission(haettuKayttooikeusRyhma.anomus.organisaatioOid, haettuKayttooikeusRyhma.kayttoOikeusRyhma.id);
        const henkilo =haettuKayttooikeusRyhma.anomus.henkilo;
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <MyonnaButton myonnaAction={() => this.updateHaettuKayttooikeusryhma(haettuKayttooikeusRyhma.id,
                    'MYONNETTY', idx, henkilo)}
                              L={this.L}
                              disabled={noPermission} />
            </div>
            <div style={{display: 'table-cell'}}>
                <PopupButton popupClass={'oph-popup-default oph-popup-bottom'}
                             popupTitle={<span className="oph-h3 oph-strong">{this.L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_HAKEMUS']}</span>}
                             popupArrowStyles={{marginLeft: '230px'}}
                             popupButtonClasses={'oph-button oph-button-cancel'}
                             popupStyle={{right: '0px', width: '20rem', padding: '30px', position: 'absolute'}}
                             popupContent={<AnomusHylkaysPopup L={this.L}
                                                               kayttooikeusryhmaId={haettuKayttooikeusRyhma.id}
                                                               index={idx}
                                                               henkilo={henkilo}
                                                               action={this.updateHaettuKayttooikeusryhma}>
                             </AnomusHylkaysPopup>}>
                    {this.L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA']}
                </PopupButton>
            </div>

        </div>
    };

    updateHaettuKayttooikeusryhma = (id: number, tila: string, idx: number, henkilo: any, hylkaysperuste?: string) => {
        this.props.updateHaettuKayttooikeusryhma(id, tila,
            this.state.dates[idx].alkupvm.format(PropertySingleton.state.PVM_DBFORMAATTI),
            this.state.dates[idx].loppupvm.format(PropertySingleton.state.PVM_DBFORMAATTI),
            henkilo, hylkaysperuste);
    };

    async cancelAnomus(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma) {
        const url = urls.url('kayttooikeus-service.omattiedot.anomus.muokkaus');
        await http.put(url, haettuKayttooikeusRyhma.id);
        if(this.props.fetchAllKayttooikeusAnomusForHenkilo) {
            this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.isOmattiedot.data.oid);
        }
    };

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    hasNoPermission(organisaatioOid: string, kayttooikeusryhmaId: number) {
        return !this.props.kayttooikeus.grantableKayttooikeusLoading
            && !(this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid]
            && this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid].indexOf(kayttooikeusryhmaId) === 0);
    };
    
    showExtraInfo = (row: any) => {
        console.log(this);
        console.log(this.props.kayttooikeus.kayttooikeusAnomus[row.index]);
    };

    render() {
        this.createRows();
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    {!this.props.piilotaOtsikko && <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>}
                    <div>
                        <Table headings={this.tableHeadings}
                               data={this._rows}
                               noDataText={this.L['HENKILO_KAYTTOOIKEUS_AVOIN_TYHJA']}
                               {...this.props.manualSortSettings}
                               fetchMoreSettings={this.props.fetchMoreSettings}
                               isLoading={this.props.tableLoading}
                               striped={this.props.striped}
                               subComponent={this.showExtraInfo}/>
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewOpenKayttooikeusanomus;
