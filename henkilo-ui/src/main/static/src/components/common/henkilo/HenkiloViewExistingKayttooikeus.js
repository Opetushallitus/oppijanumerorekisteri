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
import EmailSelect from "./select/EmailSelect";
import WideBlueNotification from "../../common/notifications/WideBlueNotification";

class HenkiloViewExistingKayttooikeus extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        oidHenkilo: PropTypes.string.isRequired,
        kayttooikeus: PropTypes.shape({
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

    };

    componentWillReceiveProps(nextProps) {
        const emailOptions = this._parseEmailOptions(nextProps.henkilo);
        this.setState({ emailOptions });
        if(emailOptions.length === 1) {
            this.setState({
                emailSelection: emailOptions[0],
                missingEmail: false,
                showMissingEmailNotification: false
            });
        } else if(emailOptions.length > 1) {
            this.setState({missingEmail: false, showMissingEmailNotification: false});
        } else {
            this.setState({missingEmail: true, showMissingEmailNotification: true});
        }
    }

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
                alkupvm: moment(this.state.dates[idx].alkupvm).format(this.L['PVM_DBFORMAATTI']),
                loppupvm: moment(this.state.dates[idx].loppupvm).format(this.L['PVM_DBFORMAATTI']),
            }]);
        };

        this.state = {
            dates: this.props.kayttooikeus.kayttooikeus
                .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
                .map(kayttooikeusAnomus => ({
                    alkupvm: moment(),
                    loppupvm: moment().add(1, 'years')
                })),
            emailSelection: this.props.kayttooikeus.kayttooikeus
                .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
                .map(uusittavaKayttooikeusRyhma => ''),
            emailOptions: this._parseEmailOptions(this.props.henkilo),
            missingEmail: false
        };
    };

    loppupvmAction(value, idx) {
        const dates = [...this.state.dates];
        dates[idx].loppupvm = value;
        this.setState({
            dates: dates,
        });
    };

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
                                        filterDate={(date) => date.isBefore(moment().add(1, 'years'))} />
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
                        {
                            this.state.emailOptions.length > 1 ?
                                <EmailSelect changeEmailAction={(value) => {this.setState({emailSelection: update(this.state.emailSelection, {[idx]: {$set: value}}),});}}
                                             emailSelection={this.state.emailSelection[idx]}
                                             emailOptions={this.state.emailOptions}/> : null
                        }
                        <HaeJatkoaikaaButton haeJatkoaikaaAction={() => this._createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx)}
                                             disabled={this.state.emailSelection[idx] === '' || this.state.emailOptions.length === 0} />
                    </div>,
                }
            });
    };

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    hasNoPermission(organisaatioOid, kayttooikeusryhmaId) {
        return !this.props.kayttooikeus.grantableKayttooikeusLoading
            && !(this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid]
            && this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid].indexOf(kayttooikeusryhmaId) === 0);
    };

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
                    this.props.isOmattiedot && this.state.showMissingEmailNotification ? <WideBlueNotification message={this.L['OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_OLEMASSAOLEVA_KAYTTOOIKEUS']} closeAction={() => {this.setState({showMissingEmailNotification: false})}} /> : null
                }
                <div>
                    <Table headings={this.tableHeadings}
                           data={this._rows}
                           noDataText={this.L['HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA']}
                    />
                </div>
            </div>
        );
    };

    _parseEmailOptions(henkilo) {
        let emails = [];
        if (henkilo.henkilo.yhteystiedotRyhma) {
            henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
                yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                    if (yhteys.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI') {
                        emails.push(yhteys.yhteystietoArvo);
                    }
                })
            });
        }

        return emails.map(email => ({value: email, label: email}));
    };

    async _createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx) {
        const kayttooikeusRyhmaIds = [uusittavaKayttooikeusRyhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: uusittavaKayttooikeusRyhma.organisaatioOid,
            email: this.state.emailSelection[idx],
            tehtavaNimike: '',
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: this.props.oidHenkilo
        };
        await this.props.createKayttooikeusanomus(anomusData);
        this.setState({emailSelection: update(this.state.emailSelection, {[idx]: {$set: ''}}),});
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);
    };

}

export default HenkiloViewExistingKayttooikeus;
