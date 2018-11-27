// @flow
import './HenkiloViewExpiredKayttooikeus.css';
import React from 'react';
import {connect} from 'react-redux';
import Table from '../table/Table';
import moment from 'moment';
import DatePicker from "react-datepicker";
import MyonnaButton from "./buttons/MyonnaButton";
import Notifications from "../notifications/Notifications";
import SuljeButton from "./buttons/SuljeButton";
import StaticUtils from '../StaticUtils'
import HaeJatkoaikaaButton from "../../omattiedot/HaeJatkoaikaaButton";
import WideBlueNotification from "../../common/notifications/WideBlueNotification";
import PropertySingleton from "../../../globals/PropertySingleton";
import { toLocalizedText } from '../../../localizabletext';
import {addKayttooikeusToHenkilo, removePrivilege, fetchAllKayttooikeusAnomusForHenkilo} from '../../../actions/kayttooikeusryhma.actions';
import type {Localisations, L10n} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";
import type {TableHeading} from "../../../types/react-table.types";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import {createKayttooikeusanomus} from "../../../actions/kayttooikeusryhma.actions";
import type {KayttooikeusRyhmaState} from "../../../reducers/kayttooikeusryhma.reducer";
import {removeNotification} from '../../../actions/notifications.actions';
import * as R from 'ramda';
import type {OmattiedotState} from "../../../reducers/omattiedot.reducer";
import {createEmailOptions} from "../../../utilities/henkilo.util";
import type {MyonnettyKayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import {KAYTTOOIKEUDENTILA} from "../../../globals/KayttooikeudenTila";

type Props = {
    l10n: L10n,
    locale: Locale,
    oidHenkilo: string,
    omattiedot: OmattiedotState,
    henkilo: HenkiloState,
    kayttooikeus: KayttooikeusRyhmaState,
    organisaatioCache: {[string]: {
            nimi: {},
            tyypit: Array<string>,
        }},
    notifications: {
        existingKayttooikeus: Array<any>,
    },
    removeNotification: (string, string, ?string) => void,
    removePrivilege: (string, string, number) => void,
    fetchAllKayttooikeusAnomusForHenkilo: (string) => void,
    isOmattiedot: boolean,
    vuosia: number,
    addKayttooikeusToHenkilo: (string, string, Array<{
        id: number,
        kayttooikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
    }>) => void,
    createKayttooikeusanomus: ({
        organisaatioOrRyhmaOid: string,
        email: ?string,
        perustelut: string,
        kayttooikeusRyhmaIds: Array<number>,
        anojaOid: string,
    }) => void,
}
type EmailOption = {
    value: ?string,
}

type State = {
    dates: Array<{alkupvm: moment, loppupvm: moment,}>,
    emailSelection: Array<EmailOption>,
    emailOptions: Array<EmailOption>,
    showMissingEmailNotification: boolean,
    missingEmail: boolean,
}

class HenkiloViewExistingKayttooikeus extends React.Component<Props, State> {
    L: Localisations;
    headingList: Array<TableHeading>;
    tableHeadings: Array<TableHeading>;
    _rows: Array<{[string]: any}>;
    updateKayttooikeusryhma: (number, string, number, string) => void;

    constructor(props: Props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA', minWidth: 200,},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS', minWidth: 150,},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM', Cell: cellProps => cellProps.value.format()},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM', Cell: cellProps => cellProps.value.format()},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 125,
                Cell: cellProps => cellProps.value.kasitelty.format() + ' / ' + cellProps.value.kasittelija,
                sortMethod: (a, b) => {
                    const kasiteltyCompare = a.kasitelty.valueOf() - b.kasitelty.valueOf()
                    if (kasiteltyCompare !== 0) {
                        return kasiteltyCompare
                    }
                    return a.kasittelija.localeCompare(b.kasittelija)
                }},
            {key: 'HENKILO_KAYTTOOIKEUS_JATKOAIKA', minWidth: 150, notSortable: true, hide: this.props.isOmattiedot},
            {key: 'HENKILO_KAYTTOOIKEUS_SULJE', notSortable: true, hide: this.props.isOmattiedot},
            {key: 'HIGHLIGHT', hide: true},
            {key: 'HENKILO_KAYTTOOIKEUS_ANO_JATKOAIKA', notSortable: true, hide: !this.props.isOmattiedot},
        ];
        this.tableHeadings = this.headingList.map(heading => Object.assign({}, heading, {label: (this.L[heading.key] || '')}));

        this.state = {
            dates: this.props.kayttooikeus.kayttooikeus
                .filter(this._filterExpiredKayttooikeus)
                .map(kayttooikeusAnomus => ({
                    alkupvm: moment(),
                    loppupvm: this.props.vuosia ? moment().add(this.props.vuosia, 'years') : moment(kayttooikeusAnomus.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI).add(1, 'years')
                })),
            ...createEmailOptions(this.props.henkilo, this._filterExpiredKayttooikeus, this.props.kayttooikeus.kayttooikeus),
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            ...createEmailOptions(nextProps.henkilo, this._filterExpiredKayttooikeus, this.props.kayttooikeus.kayttooikeus),
        });
    }

    loppupvmAction(value, idx) {
        const dates = [...this.state.dates];
        dates[idx].loppupvm = value;
        this.setState({
            dates: dates,
        });
    }

    createRows(headingList: Array<string>) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(this._filterExpiredKayttooikeus)
            .map((uusittavaKayttooikeusRyhma, idx) => {
                const organisaatio = this.props.organisaatioCache[uusittavaKayttooikeusRyhma.organisaatioOid]
                    || StaticUtils.defaultOrganisaatio(uusittavaKayttooikeusRyhma.organisaatioOid, this.props.l10n);
                return {
                    [headingList[0]]: toLocalizedText(this.props.locale, organisaatio.nimi) + ' '
                    + StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, this.L),
                    [headingList[1]]: uusittavaKayttooikeusRyhma.ryhmaNames.texts
                        .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                    [headingList[2]]: moment(uusittavaKayttooikeusRyhma.alkuPvm, PropertySingleton.state.PVM_DBFORMAATTI),
                    [headingList[3]]: moment(uusittavaKayttooikeusRyhma.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI),
                    [headingList[4]]: {kasitelty: moment(uusittavaKayttooikeusRyhma.kasitelty),
                        kasittelija: uusittavaKayttooikeusRyhma.kasittelijaNimi || uusittavaKayttooikeusRyhma.kasittelijaOid},
                    [headingList[5]]: <div>
                        <div style={{display: 'table-cell', paddingRight: '10px'}}>
                            <DatePicker className="oph-input"
                                        onChange={(value) => this.loppupvmAction(value, idx)}
                                        selected={this.state.dates[idx].loppupvm}
                                        showYearDropdown
                                        showWeekNumbers
                                        disabled={this.hasNoPermission(uusittavaKayttooikeusRyhma.organisaatioOid, uusittavaKayttooikeusRyhma.ryhmaId)}
                                        filterDate={(date) => Number.isInteger(this.props.vuosia) ? date.isBefore(moment().add(this.props.vuosia, 'years')) : true} />
                        </div>
                        <div style={{display: 'table-cell'}}>
                            <MyonnaButton
                                myonnaAction={() => this.updateKayttooikeusryhma(uusittavaKayttooikeusRyhma.ryhmaId, KAYTTOOIKEUDENTILA.MYONNETTY, idx,
                                    uusittavaKayttooikeusRyhma.organisaatioOid)}
                                L={this.L}
                                disabled={this.hasNoPermission(uusittavaKayttooikeusRyhma.organisaatioOid, uusittavaKayttooikeusRyhma.ryhmaId)} />
                        </div>
                    </div>,
                    [headingList[6]]: <SuljeButton suljeAction={() => this.props.removePrivilege(this.props.oidHenkilo,
                        uusittavaKayttooikeusRyhma.organisaatioOid, uusittavaKayttooikeusRyhma.ryhmaId)}
                                                   L={this.L}
                                                   disabled={this.hasNoPermission(uusittavaKayttooikeusRyhma.organisaatioOid, uusittavaKayttooikeusRyhma.ryhmaId)} />,
                    [headingList[7]]: this.props.notifications.existingKayttooikeus.some(notification => {
                        return notification.ryhmaIdList && notification.ryhmaIdList
                            .some(ryhmaId => ryhmaId === uusittavaKayttooikeusRyhma.ryhmaId
                                && uusittavaKayttooikeusRyhma.organisaatioOid === (notification.organisaatioOid && notification.organisaatioOid));
                    }),
                    [headingList[8]]: <div>
                        {this.createEmailSelectionIfMoreThanOne(idx)}
                        <HaeJatkoaikaaButton haeJatkoaikaaAction={() => this._createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx)}
                                             disabled={this.isHaeJatkoaikaaButtonDisabled(idx, uusittavaKayttooikeusRyhma)} />
                    </div>,
                }
            });
    }

    updateKayttooikeusryhma(id, kayttooikeudenTila, idx, organisaatioOid) {
        this.props.addKayttooikeusToHenkilo(this.props.oidHenkilo, organisaatioOid, [{
            id,
            kayttooikeudenTila,
            alkupvm: moment(this.state.dates[idx].alkupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
            loppupvm: moment(this.state.dates[idx].loppupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
        }]);
    }

    isHaeJatkoaikaaButtonDisabled(idx, uusittavaKayttooikeusRyhma) {
        const anomusAlreadyExists = !!this.props.kayttooikeus.kayttooikeusAnomus
            .filter(haettuKayttooikeusRyhma => haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === uusittavaKayttooikeusRyhma.ryhmaId
                && uusittavaKayttooikeusRyhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid)[0];
        return this.state.emailSelection[idx].value === '' || this.state.emailOptions.length === 0 || anomusAlreadyExists;
    }

    createEmailSelectionIfMoreThanOne(idx) {
        return this.state.emailOptions.length > 1
            ? this.state.emailOptions.map((email, idx2) => <div key={idx2}>
                <input type="radio"
                       checked={this.state.emailSelection[idx].value === email.value}
                       onChange={() => this.setState( { emailSelection: R.update(idx, email, this.state.emailSelection)} )}
                />
                <span>{email.value}</span>
            </div>)
            : null;
    }

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    hasNoPermission(organisaatioOid, kayttooikeusryhmaId) {
        return !this.props.kayttooikeus.grantableKayttooikeusLoading
            && !(this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid]
                && this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid].includes(kayttooikeusryhmaId));
    }

    render() {
        this.createRows(this.headingList.map(heading => heading.key));
        return (
            <div className="henkiloViewUserContentWrapper">
                <div className="header">
                    <p className="oph-h2 oph-bold">{this.L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                </div>
                <Notifications
                    notifications={this.props.notifications.existingKayttooikeus}
                    L={this.L}
                    closeAction={(status, id) => this.props.removeNotification(status, 'existingKayttooikeus', id)}
                />
                {
                    this.props.isOmattiedot && this.state.showMissingEmailNotification
                        ? <WideBlueNotification message={this.L['OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_OLEMASSAOLEVA_KAYTTOOIKEUS']}
                                                closeAction={() => {this.setState({showMissingEmailNotification: false})}} />
                        : null
                }
                <div>
                    <Table headings={this.tableHeadings}
                           data={this._rows}
                           noDataText={this.L['HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA']}
                    />
                </div>

            </div>
        );
    }

    async _createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx) {
        const kayttooikeusRyhmaIds = [uusittavaKayttooikeusRyhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: uusittavaKayttooikeusRyhma.organisaatioOid,
            email: this.state.emailSelection[idx].value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: this.props.oidHenkilo
        };
        await this.props.createKayttooikeusanomus(anomusData);
        const oid: any = R.path(['omattiedot','data','oid'], this.props);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
    }

    _filterExpiredKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return kayttooikeus.tila !== KAYTTOOIKEUDENTILA.SULJETTU && kayttooikeus.tila !== KAYTTOOIKEUDENTILA.VANHENTUNUT
    }

}

const mapStateToProps = state => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
    henkilo: state.henkilo,
    kayttooikeus: state.kayttooikeus,
    notifications: state.notifications,
});

export default connect(mapStateToProps, {
    addKayttooikeusToHenkilo,
    removePrivilege,
    removeNotification,
    fetchAllKayttooikeusAnomusForHenkilo,
    createKayttooikeusanomus})(HenkiloViewExistingKayttooikeus);
