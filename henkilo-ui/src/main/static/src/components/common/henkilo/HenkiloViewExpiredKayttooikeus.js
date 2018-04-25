import './HenkiloViewExistingKayttooikeus.css'
import React from 'react'
import PropTypes from 'prop-types'
import Table from '../table/Table'
import moment from 'moment'
import StaticUtils from '../StaticUtils'
import { toLocalizedText } from '../../../localizabletext'

class HenkiloViewExpiredKayttooikeus extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        organisaatioCache: PropTypes.objectOf(PropTypes.shape({nimi: PropTypes.object.isRequired,})),
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        const headingList = [{key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO'},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'},
            {key: 'HENKILO_KAYTTOOIKEUS_TILA'},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 150, notSortable: true},
        ];
        this.tableHeadings = headingList.map(heading => Object.assign(heading, {label: this.L[heading.key]}));

        this.createRows(headingList.map(heading => heading.key));
    };

    createRows(headingList) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(kayttooikeus => kayttooikeus.tila === 'SULJETTU').map(kayttooikeus => ({
                [headingList[0]]: toLocalizedText(this.props.locale, (this.props.organisaatioCache[kayttooikeus.organisaatioOid]
                || StaticUtils.defaultOrganisaatio(kayttooikeus.organisaatioOid, this.props.l10n)).nimi),
                [headingList[1]]: kayttooikeus.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: this.L[kayttooikeus.tila],
                [headingList[3]]: moment(kayttooikeus.kasitelty).format() + ' / ' + kayttooikeus.kasittelijaNimi || kayttooikeus.kasittelijaOid,
            }));
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table headings={this.tableHeadings}
                               data={this._rows}
                               noDataText={this.L['HENKILO_KAYTTOOIKEUS_SULKEUTUNEET_TYHJA']} />
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewExpiredKayttooikeus;
