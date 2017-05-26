import React from 'react'
import Table from '../common/table/Table'
import dateformat from 'dateformat'
import StaticUtils from "../common/StaticUtils";
import Notifications from "../common/notifications/Notifications";

class HenkiloViewExistingKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        kayttooikeus: React.PropTypes.shape({kayttooikeus: React.PropTypes.array.isRequired}).isRequired,
        organisaatioCache: React.PropTypes.objectOf(React.PropTypes.shape({nimi: React.PropTypes.object.isRequired,})),
        notifications: React.PropTypes.shape({
            existingKayttooikeus: React.PropTypes.array.isRequired,
        }),
        removeNotification: React.PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.headingList = [{key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA', minWidth: 200,},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS', minWidth: 150,},
            {key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM'},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 125,},
            {key: 'HIGHLIGHT', hide: true}
        ];
        this.tableHeadings = this.headingList.map(heading => Object.assign(heading, {label: this.L[heading.key] || heading.key}));

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
                [headingList[0]]: this.props.organisaatioCache[uusittavaKayttooikeusRyhma.organisaatioOid].nimi[this.props.locale] +
                (uusittavaKayttooikeusRyhma.tehtavanimike ? ' / ' + uusittavaKayttooikeusRyhma.tehtavanimike : ''),
                [headingList[1]]: uusittavaKayttooikeusRyhma.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: dateformat(new Date(uusittavaKayttooikeusRyhma.alkuPvm), this.L['PVM_FORMAATTI']),
                [headingList[3]]: dateformat(new Date(uusittavaKayttooikeusRyhma.voimassaPvm), this.L['PVM_FORMAATTI']),
                [headingList[4]]: dateformat(uusittavaKayttooikeusRyhma.kasitelty, this.L['PVM_FORMAATTI']) + ' / '
                + uusittavaKayttooikeusRyhma.kasittelijaNimi || uusittavaKayttooikeusRyhma.kasittelijaOid,
                [headingList[5]]: this.props.notifications.existingKayttooikeus.some(notification => {
                    return notification.ryhmaIdList
                        .some(ryhmaId => ryhmaId === uusittavaKayttooikeusRyhma.ryhmaId
                        && uusittavaKayttooikeusRyhma.organisaatioOid === notification.organisaatioOid);
                }),

            }));
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <Notifications notifications={this.props.notifications.existingKayttooikeus}
                               L={this.L}
                               closeAction={(status, id) => this.props.removeNotification(status, 'existingKayttooikeus', id)} />
                <div className="header">
                    <p className="oph-h2 oph-bold">{this.L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                </div>
                <div>
                    <Table headings={this.tableHeadings}
                           data={this._rows}
                           noDataText={this.L['HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA']}
                    />
                </div>
            </div>
        );
    };

}

export default HenkiloViewExistingKayttooikeus;
