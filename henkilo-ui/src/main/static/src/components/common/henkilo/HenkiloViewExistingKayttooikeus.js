import './HenkiloViewExpiredKayttooikeus.css'
import React from 'react'
import PropTypes from 'prop-types'
import update from 'react-addons-update'
import Table from '../table/Table'
import moment from 'moment'
import DatePicker from "react-datepicker";
import MyonnaButton from "./buttons/MyonnaButton";
import Notifications from "../notifications/Notifications";
import SuljeButton from "./buttons/SuljeButton";
import StaticUtils from '../StaticUtils'
import HaeJatkoaikaaButton from "../../omattiedot/HaeJatkoaikaaButton";
import WideBlueNotification from "../../common/notifications/WideBlueNotification";
import PropertySingleton from "../../../globals/PropertySingleton";

class HenkiloViewExistingKayttooikeus extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        oidHenkilo: PropTypes.string.isRequired,
        kayttooikeus: PropTypes.shape({
            kayttooikeusAnomus: PropTypes.array,
            kayttooikeus: PropTypes.array.isRequired,
            grantableKayttooikeus: PropTypes.object.isRequired,
        }).isRequired,
        organisaatioCache: PropTypes.objectOf(PropTypes.shape({nimi: PropTypes.object.isRequired,})),
        notifications: PropTypes.shape({
            existingKayttooikeus: PropTypes.array.isRequired,
        }),
        removeNotification: PropTypes.func,
        removePrivilege: PropTypes.func,
        isOmattiedot: PropTypes.bool,
        vuosia: PropTypes.number,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [
            {key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA', minWidth: 200,},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS', minWidth: 150,},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 125,},
            {key: 'HENKILO_KAYTTOOIKEUS_JATKOAIKA', minWidth: 150, notSortable: true, hide: this.props.isOmattiedot},
            {key: 'HENKILO_KAYTTOOIKEUS_SULJE', notSortable: true, hide: this.props.isOmattiedot},
            {key: 'HIGHLIGHT', hide: true},
            {key: 'HENKILO_KAYTTOOIKEUS_ANO_JATKOAIKA', notSortable: true, hide: !this.props.isOmattiedot},
        ];
        this.tableHeadings = this.headingList.map(heading => Object.assign(heading, {label: this.L[heading.key] || ''}));

        this.updateKayttooikeusryhma = (id, kayttooikeudenTila, idx, organisaatioOid) => {
            this.props.addKayttooikeusToHenkilo(this.props.oidHenkilo, organisaatioOid, [{
                id,
                kayttooikeudenTila,
                alkupvm: moment(this.state.dates[idx].alkupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                loppupvm: moment(this.state.dates[idx].loppupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
            }]);
        };

        this.state = {
            dates: this.props.kayttooikeus.kayttooikeus
                .filter(kayttooikeus => kayttooikeus.tila !== PropertySingleton.getState().KAYTTOOIKEUS_SULJETTU)
                .map(kayttooikeusAnomus => ({
                    alkupvm: moment(),
                    loppupvm: moment().add(1, 'years')
                })),
            ...this.createEmailOptions(this.props.henkilo),
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.createEmailOptions(nextProps.henkilo));
    }


    createEmailOptions(henkilo) {
        const emailOptions = this._parseEmailOptions(henkilo);
        if(emailOptions.length === 1) {
            return {
                emailSelection: this.props.kayttooikeus.kayttooikeus
                    .filter(kayttooikeus => kayttooikeus.tila !== PropertySingleton.getState().KAYTTOOIKEUS_SULJETTU)
                    .map(uusittavaKayttooikeusRyhma => emailOptions[0]),
                missingEmail: false,
                showMissingEmailNotification: false,
                emailOptions,
            };
        }
        else if(emailOptions.length > 1) {
            return {
                missingEmail: false,
                showMissingEmailNotification: false, emailOptions,
                emailSelection: this.props.kayttooikeus.kayttooikeus
                    .filter(kayttooikeus => kayttooikeus.tila !== PropertySingleton.getState().KAYTTOOIKEUS_SULJETTU)
                    .map(uusittavaKayttooikeusRyhma => ''),
            };
        }
        return {
            missingEmail: true,
            showMissingEmailNotification: true, emailOptions,
            emailSelection: this.props.kayttooikeus.kayttooikeus
                .filter(kayttooikeus => kayttooikeus.tila !== PropertySingleton.getState().KAYTTOOIKEUS_SULJETTU)
                .map(uusittavaKayttooikeusRyhma => ''),
        };
    }

    loppupvmAction(value, idx) {
        const dates = [...this.state.dates];
        dates[idx].loppupvm = value;
        this.setState({
            dates: dates,
        });
    }

    createRows(headingList) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
            .map((uusittavaKayttooikeusRyhma, idx) => {
                const organisaatio = this.props.organisaatioCache[uusittavaKayttooikeusRyhma.organisaatioOid]
                    || StaticUtils.defaultOrganisaatio(uusittavaKayttooikeusRyhma.organisaatioOid, this.props.l10n);
                return {
                    [headingList[0]]: organisaatio.nimi[this.props.locale] + ' '
                    + StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, this.L),
                    [headingList[1]]: uusittavaKayttooikeusRyhma.ryhmaNames.texts
                        .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                    [headingList[2]]: moment(new Date(uusittavaKayttooikeusRyhma.alkuPvm)).format(),
                    [headingList[3]]: moment(new Date(uusittavaKayttooikeusRyhma.voimassaPvm)).format(),
                    [headingList[4]]: moment(uusittavaKayttooikeusRyhma.kasitelty).format() + ' / '
                    + uusittavaKayttooikeusRyhma.kasittelijaNimi || uusittavaKayttooikeusRyhma.kasittelijaOid,
                    [headingList[5]]: <div>
                        <div style={{display: 'table-cell', paddingRight: '10px'}}>
                            <DatePicker className="oph-input"
                                        onChange={(value) => this.loppupvmAction(value, idx)}
                                        selected={this.state.dates[idx].loppupvm}
                                        showYearDropdown
                                        showWeekNumbers
                                        filterDate={(date) => Number.isInteger(this.props.vuosia) ? date.isBefore(moment().add(this.props.vuosia, 'years')) : true} />
                        </div>
                        <div style={{display: 'table-cell'}}>
                            <MyonnaButton
                                myonnaAction={() => this.updateKayttooikeusryhma(uusittavaKayttooikeusRyhma.ryhmaId, 'MYONNETTY', idx,
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
                        return notification.ryhmaIdList
                            .some(ryhmaId => ryhmaId === uusittavaKayttooikeusRyhma.ryhmaId
                            && uusittavaKayttooikeusRyhma.organisaatioOid === notification.organisaatioOid);
                    }),
                    [headingList[8]]: <div>
                        {this.createEmailSelectionIfMoreThanOne(idx)}
                        <HaeJatkoaikaaButton haeJatkoaikaaAction={() => this._createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx)}
                                             disabled={this.isHaeJatkoaikaaButtonDisabled(idx, uusittavaKayttooikeusRyhma)} />
                    </div>,
                }
            });
    }

    isHaeJatkoaikaaButtonDisabled(idx, uusittavaKayttooikeusRyhma) {
        const anomusAlreadyExists = !!this.props.kayttooikeus.kayttooikeusAnomus
            .filter(haettuKayttooikeusRyhma => haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === uusittavaKayttooikeusRyhma.ryhmaId
                && uusittavaKayttooikeusRyhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid)[0];
        return this.state.emailSelection[idx] === '' || this.state.emailOptions.length === 0 || anomusAlreadyExists;
    }

    createEmailSelectionIfMoreThanOne(idx) {
        return this.state.emailOptions.length > 1
            ? this.state.emailOptions.map((email, idx2) => <div key={idx2}>
                <input type="radio"
                       checked={this.state.emailSelection[idx].value === email.value}
                       onChange={() => {this.setState({emailSelection: update(this.state.emailSelection, {[idx]: {$set: email}}),});}}
                />
                <span>{email.value}</span>
            </div>)
            : null;
    }

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    hasNoPermission(organisaatioOid, kayttooikeusryhmaId) {
        return !this.props.kayttooikeus.grantableKayttooikeusLoading
            && !(this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid]
            && this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid].indexOf(kayttooikeusryhmaId) === 0);
    }

    render() {
        this.createRows(this.headingList.map(heading => heading.key));
        return (
            <div className="henkiloViewUserContentWrapper">
                <div className="header">
                    <p className="oph-h2 oph-bold">{this.L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                </div>
                <Notifications notifications={this.props.notifications.existingKayttooikeus}
                               L={this.L}
                               closeAction={(status, id) => this.props.removeNotification(status, 'existingKayttooikeus', id)} />
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

    _parseEmailOptions(henkilo) {
        let emails = [];
        if (henkilo.henkilo.yhteystiedotRyhma) {
            henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
                yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                    if (yhteys.yhteystietoTyyppi === PropertySingleton.getState().SAHKOPOSTI) {
                        emails.push(yhteys.yhteystietoArvo);
                    }
                })
            });
        }

        return emails.map(email => ({value: email, label: email}));
    }



    async _createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx) {
        const kayttooikeusRyhmaIds = [uusittavaKayttooikeusRyhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: uusittavaKayttooikeusRyhma.organisaatioOid,
            email: this.state.emailSelection[idx].value,
            tehtavaNimike: '',
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: this.props.oidHenkilo
        };
        await this.props.createKayttooikeusanomus(anomusData);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);
    }

}

export default HenkiloViewExistingKayttooikeus;
