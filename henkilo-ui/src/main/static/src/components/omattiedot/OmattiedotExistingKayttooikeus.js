import React from 'react'
import Table from '../common/table/Table'
import moment from 'moment'
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

        this.updateKayttooikeusryhma = (id, kayttooikeudenTila, idx, organisaatioOid) => {
            this.props.addKayttooikeusToHenkilo(this.props.oidHenkilo, organisaatioOid, [{
                id,
                kayttooikeudenTila,
                alkupvm: this.state.dates[idx].alkupvm.format(this.L['PVM_DBFORMAATTI']),
                loppupvm: this.state.dates[idx].loppupvm.format(this.L['PVM_DBFORMAATTI']),
            }]);
        };
        this.state = {
            dates: this.props.kayttooikeus.kayttooikeus
                .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
                .map(kayttooikeusAnomus => ({
                    alkupvm: moment(),
                    loppupvm: moment().add(1, 'years'),
                })),
        }
    };

    createRows(headingList) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(kayttooikeus => kayttooikeus.tila !== 'SULJETTU')
            .map((uusittavaKayttooikeusRyhma, idx) => ({
                [headingList[0]]: this.props.organisaatioCache[uusittavaKayttooikeusRyhma.organisaatioOid].nimi[this.props.locale] +
                (uusittavaKayttooikeusRyhma.tehtavanimike ? ' / ' + uusittavaKayttooikeusRyhma.tehtavanimike : ''),
                [headingList[1]]: uusittavaKayttooikeusRyhma.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: moment(uusittavaKayttooikeusRyhma.alkuPvm).format(),
                [headingList[3]]: moment(uusittavaKayttooikeusRyhma.voimassaPvm).format(),
                [headingList[4]]: moment(uusittavaKayttooikeusRyhma.kasitelty).format() + ' / '
                + uusittavaKayttooikeusRyhma.kasittelijaNimi || uusittavaKayttooikeusRyhma.kasittelijaOid,
                [headingList[5]]: this.props.notifications.existingKayttooikeus.some(notification => {
                    return notification.ryhmaIdList
                        .some(ryhmaId => ryhmaId === uusittavaKayttooikeusRyhma.ryhmaId
                        && uusittavaKayttooikeusRyhma.organisaatioOid === notification.organisaatioOid);
                }),

            }));
    };

    render() {
        this.createRows(this.headingList.map(heading => heading.key));
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
