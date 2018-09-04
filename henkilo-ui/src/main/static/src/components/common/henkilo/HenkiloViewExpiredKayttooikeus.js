// @flow
import './HenkiloViewExistingKayttooikeus.css'
import React from 'react'
import {connect} from 'react-redux';
import Table from '../table/Table'
import moment from 'moment'
import StaticUtils from '../StaticUtils'
import { toLocalizedText } from '../../../localizabletext'
import type {L, L10n} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";
import type {TableHeading} from "../../../types/react-table.types";
import type {KayttooikeusRyhmaState} from "../../../reducers/kayttooikeusryhma.reducer";
import HaeJatkoaikaaButton from "../../omattiedot/HaeJatkoaikaaButton";
import {update, path} from 'ramda';
import type {EmailOption} from "../../../types/emailoption.type";
import {createEmailOptions} from "../../../utilities/henkilo.util";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import {
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo
} from "../../../actions/kayttooikeusryhma.actions";
import type {MyonnettyKayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import type {OmattiedotState} from "../../../reducers/omattiedot.reducer";

type Props = {
    l10n: L10n,
    locale: Locale,
    organisaatioCache: any,
    kayttooikeus: KayttooikeusRyhmaState,
    isOmattiedot: boolean,
    henkilo: HenkiloState,
    oidHenkilo: string,
    createKayttooikeusanomus: ({
        organisaatioOrRyhmaOid: string,
        email: ?string,
        perustelut: string,
        kayttooikeusRyhmaIds: Array<number>,
        anojaOid: string,
    }) => void,
    fetchAllKayttooikeusAnomusForHenkilo: (string) => void,
    omattiedot: OmattiedotState,

}

type State = {
    emailOptions: Array<EmailOption>,
    emailSelection: Array<EmailOption>,
    missingEmail: boolean,
    showMissingEmailNotification: boolean
}

class HenkiloViewExpiredKayttooikeus extends React.Component<Props, State> {

    L: L;
    tableHeadings: Array<TableHeading>;
    _rows: Array<any>;

    constructor(props: Props) {
        super(props);
        
        this.L = this.props.l10n[this.props.locale];

        const headingList = [{key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO'},
            {key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'},
            {key: 'HENKILO_KAYTTOOIKEUS_TILA'},
            {key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA', minWidth: 150,
                Cell: cellProps => cellProps.value.kasitelty.format() + ' / ' + cellProps.value.kasittelija,
                sortMethod: (a, b) => {
                    const kasiteltyCompare = a.kasitelty.valueOf() - b.kasitelty.valueOf();
                    if (kasiteltyCompare !== 0) {
                        return kasiteltyCompare
                    }
                    return a.kasittelija.localeCompare(b.kasittelija)
                }},
            {key: 'HENKILO_ANO_KAYTTOOIKEUDELLE_JATKOA', notSortable: true, hide: !this.props.isOmattiedot}
        ];
        this.tableHeadings = headingList.map(heading => ({...heading, label: this.L[heading.key]}));

        this.state = {
            ...createEmailOptions(this.props.henkilo, this._filterExistingKayttooikeus, this.props.kayttooikeus.kayttooikeus)
        };
    };

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            ...createEmailOptions(nextProps.henkilo, this._filterExistingKayttooikeus, nextProps.kayttooikeus.kayttooikeus),
        });
    }

    createRows(headingList: Array<string>) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(this._filterExistingKayttooikeus)
            .map( (kayttooikeus, idx) => ({
                [headingList[0]]: toLocalizedText(this.props.locale, (this.props.organisaatioCache[kayttooikeus.organisaatioOid]
                || StaticUtils.defaultOrganisaatio(kayttooikeus.organisaatioOid, this.props.l10n)).nimi),
                [headingList[1]]: kayttooikeus.ryhmaNames.texts
                    .filter(text => text.lang === this.props.locale.toUpperCase())[0].text,
                [headingList[2]]: this.L[kayttooikeus.tila],
                [headingList[3]]: {kasitelty: moment(kayttooikeus.kasitelty), kasittelija: kayttooikeus.kasittelijaNimi || kayttooikeus.kasittelijaOid},
                [headingList[4]]: kayttooikeus.tila === 'VANHENTUNUT' && <div>
                    {this.createEmailSelectionIfMoreThanOne(idx)}
                    <HaeJatkoaikaaButton haeJatkoaikaaAction={() => this._createKayttooikeusAnomus(kayttooikeus, idx)}
                                         disabled={this.isHaeJatkoaikaaButtonDisabled(idx, kayttooikeus)} />
                </div>,
            }));
    };

    render() {
        this.createRows(this.tableHeadings.map( heading => heading.key));
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

    createEmailSelectionIfMoreThanOne(idx: number) {
        return this.state.emailOptions.length > 1
            ? this.state.emailOptions.map((email, idx2) => <div key={idx2}>
                <input type="radio"
                       checked={this.state.emailSelection[idx].value === email.value}
                       onChange={() => this.setState( { emailSelection: update(idx, email, this.state.emailSelection)} )}
                />
                <span>{email.value}</span>
            </div>)
            : null;
    }

    _filterExistingKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return kayttooikeus.tila === 'SULJETTU' || kayttooikeus.tila === 'VANHENTUNUT';
    }

    async _createKayttooikeusAnomus(kayttooikeusryhma: MyonnettyKayttooikeusryhma, idx) {
        const kayttooikeusRyhmaIds = [kayttooikeusryhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: kayttooikeusryhma.organisaatioOid,
            email: this.state.emailSelection[idx].value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: this.props.oidHenkilo
        };
        await this.props.createKayttooikeusanomus(anomusData);
        const oid: any = path(['omattiedot','data','oid'], this.props);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
    }

    isHaeJatkoaikaaButtonDisabled(idx: number, uusittavaKayttooikeusRyhma: any) {
        const anomusAlreadyExists = !!this.props.kayttooikeus.kayttooikeusAnomus
            .filter(haettuKayttooikeusRyhma => haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === uusittavaKayttooikeusRyhma.ryhmaId
                && uusittavaKayttooikeusRyhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid)[0];
        return this.state.emailSelection[idx].value === '' || this.state.emailOptions.length === 0 || anomusAlreadyExists;
    }
}

export default connect(() => ({}), {createKayttooikeusanomus, fetchAllKayttooikeusAnomusForHenkilo})(HenkiloViewExpiredKayttooikeus);
