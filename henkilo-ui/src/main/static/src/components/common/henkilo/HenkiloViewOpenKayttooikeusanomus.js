import './HenkiloViewOpenKayttooikeusanomus.css';
import React from 'react';
import PropTypes from 'prop-types';
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

class HenkiloViewOpenKayttooikeusanomus extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,

        updateHaettuKayttooikeusryhma: PropTypes.func.isRequired,
        isOmattiedot: PropTypes.bool,
        kayttooikeus: PropTypes.shape({
            kayttooikeusAnomus: PropTypes.array.isRequired,
            grantableKayttooikeus: PropTypes.object.isRequired,
            grantableKayttooikeusLoading: PropTypes.bool.isRequired,
        }),
        organisaatioCache: PropTypes.objectOf(PropTypes.shape({nimi: PropTypes.object.isRequired,})).isRequired,
        isAnomusView: PropTypes.bool,
        manualSortSettings: PropTypes.shape({
            manual: PropTypes.bool.isRequired,
            defaultSorted: PropTypes.array.isRequired,
            onFetchData: PropTypes.func.isRequired,
        }),
        fetchMoreSettings: PropTypes.object,
        tableLoading: PropTypes.bool,
        striped: PropTypes.bool,
    };

    constructor(props) {
        super(props);

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
        this.tableHeadings = this.headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));
        
        this.updateHaettuKayttooikeusryhma = (id, tila, idx, henkilo, hylkaysperuste) => {
            this.props.updateHaettuKayttooikeusryhma(id, tila,
                this.state.dates[idx].alkupvm.format(PropertySingleton.state.PVM_DBFORMAATTI),
                this.state.dates[idx].loppupvm.format(PropertySingleton.state.PVM_DBFORMAATTI),
                henkilo, hylkaysperuste);
        };

        this.state = {
            dates: this.props.kayttooikeus.kayttooikeusAnomus.map(kayttooikeusAnomus => ({
                alkupvm: moment(),
                loppupvm: moment().add(1, 'years'),
            })),
        };
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            dates: nextProps.kayttooikeus.kayttooikeusAnomus.map(kayttooikeusAnomus => ({
                alkupvm: moment(),
                loppupvm: moment().add(1, 'years'),
            })),
        });
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
                                  disabled={this.hasNoPermission(haettuKayttooikeusRyhma.anomus.organisaatioOid, haettuKayttooikeusRyhma.kayttoOikeusRyhma.id)}
                                  filterDate={(date) => date.isBefore(moment().add(1, 'years'))} />
                    : this.state.dates[idx].loppupvm.format(),
                [headingList[7]]: this.L[haettuKayttooikeusRyhma.anomus.anomusTyyppi],
                [headingList[8]]: this.props.isOmattiedot
                    ? this.anomusHandlingButtonsForOmattiedot(haettuKayttooikeusRyhma, idx)
                    : this.anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx),
            }));
    };

    createSelitePopupButton(perustelut) {
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

    anomusHandlingButtonsForOmattiedot (haettuKayttooikeusRyhma, idx) {
        return <div>
            <div style={{display: 'table-cell', paddingRight: '10px'}}>
                <Button action={this.cancelAnomus.bind(this, haettuKayttooikeusRyhma, idx)}>{this.L['HENKILO_KAYTTOOIKEUSANOMUS_PERU']}</Button>
            </div>
        </div>
    };

    anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx) {
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
                             disabled={noPermission}
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

    async cancelAnomus(haettuKayttooikeusRyhma, idx) {
        const url = urls.url('kayttooikeus-service.omattiedot.anomus.muokkaus');
        await http.put(url, haettuKayttooikeusRyhma.id);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);
    };

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
                               striped={this.props.striped} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewOpenKayttooikeusanomus;
