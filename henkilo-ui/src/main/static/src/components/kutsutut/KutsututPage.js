// @flow
import React from 'react';
import PropTypes from 'prop-types'
import moment from 'moment';
import Modal from '../common/modal/Modal';
import Button from '../common/button/Button';
import './KutsututPage.css';
import KutsututTable from './KutsututTable';
import DelayedSearchInput from "../henkilohaku/DelayedSearchInput";
import KutsututBooleanRadioButton from "./KutsututBooleanRadioButton";
import KayttooikeusryhmaSingleSelect from "../common/select/KayttooikeusryhmaSingleSelect";
import OrganisaatioSelection from "../common/select/OrganisaatioSelection";
import type {L, L10n} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {KutsuOrganisaatio, Organisaatio} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";

type Payload = {
    searchTerm: string,
    organisaatioOids: string,
    tilas: Array<string>,
    sortBy: string,
    direction: string,
    view: ?string,
    kayttooikeusryhmaIds: ?number,
}

type Props = {
    l10n: L10n,
    locale: Locale,
    kutsus: {result: Array<KutsuOrganisaatio>},
    deleteKutsu: (?number) => void,
    fetchKutsus: (Payload, number, number) => void,
    kutsuListLoading: boolean,
    organisaatiot: Array<Organisaatio>,
    clearKutsuList: () => void,
    fetchOmattiedotOrganisaatios: () => void,
    isAdmin: boolean,
    isOphVirkailija: boolean,
}

type Kutsu = {
    id?: number,
    etunimi?: string,
    sukunimi?: string,
    sahkoposti?: string,
    organisaatiot: Array<Organisaatio>,
    aikaleima: string,
}

type Sort = {
    id: string,
    desc: string,
}

type State = {
    allFetched: boolean,
    confirmDeleteFor: ?Kutsu,
    payload: Payload,

}

export default class KutsututPage extends React.Component<Props, State> {
    L: L;
    defaultLimit: number;
    defaultOffset: number;
    offset: number;
    kutsuTableHeaderToSort: {[key: string]: string};

    constructor(props: Props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.defaultLimit = 20;
        this.defaultOffset = 0;

        this.offset = 0;

        this.kutsuTableHeaderToSort = {
            KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO: 'AIKALEIMA',
            KUTSUT_NIMI_OTSIKKO: 'NIMI',
            KUTSUT_SAHKOPOSTI_OTSIKKO: 'SAHKOPOSTI',
            DEFAULT: '',
        };
        // Default that is fetched at start. Needs to match to KutsututBooleanRadioButton falseLabel.

        this.state = {
            confirmDeleteFor: null,
            allFetched: false,
            payload: {
                searchTerm: '',
                organisaatioOids: '',
                tilas: ['AVOIN'],
                sortBy: 'AIKALEIMA',
                direction: 'DESC',
                view: null,
                kayttooikeusryhmaIds: null,
            },
        };
    }

    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        kutsus: PropTypes.object.isRequired,
        deleteKutsu: PropTypes.func.isRequired,
        fetchKutsus: PropTypes.func.isRequired,
        kutsuListLoading: PropTypes.bool.isRequired,
        organisaatiot: PropTypes.array.isRequired,
        clearKutsuList: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        // Update kutsus if payload changes. Basically payload.view change sets this for initial fetch.
        if (Object.keys(this.state.payload)
                .some(key => this.state.payload[key] !== prevState.payload[key])) {
            this.fetchKutsus();
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            allFetched: !nextProps.kutsuListLoading
            && (nextProps.kutsus.result.length < this.defaultLimit
                || nextProps.kutsus.result.length === this.props.kutsus.result.length),
        });
    }

    render() {
        const kutsuResponse = this.props.kutsus;
        return (
            <div className="wrapper" id="kutsutut-page">
                <div className="header">
                    <span className="oph-h2 oph-strong">{this.L['KUTSUTUT_VIRKAILIJAT_OTSIKKO']}</span>
                    <span className="right">
                        <KutsututBooleanRadioButton view={this.state.payload.view}
                                                    setView={this.setView.bind(this)} />
                    </span>
                </div>
                <div className="flex-horizontal flex-align-center">
                    <div className="flex-item-1">
                        <DelayedSearchInput setSearchQueryAction={this.onHakutermiChange.bind(this)}
                                            defaultNameQuery={this.state.payload.searchTerm}
                                            placeholder={this.L['KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO']}
                                            loading={this.props.kutsuListLoading} />
                    </div>
                    <div className="flex-item-1">
                        <OrganisaatioSelection organisaatios={this.props.organisaatiot}
                                               selectOrganisaatio={this.onOrganisaatioChange.bind(this)}
                                               selectedOrganisaatioOid={this.state.payload.organisaatioOids} />
                    </div>
                    <div className="flex-item-1" id="radiator">
                        <KayttooikeusryhmaSingleSelect kayttooikeusSelectionAction={this.onKayttooikeusryhmaChange.bind(this)} />
                    </div>
                </div>
                <KutsututTable
                    fetchKutsus={this.fetchKutsus.bind(this)}
                    L={this.L}
                    kutsus={kutsuResponse.result}
                    cancelInvitation={this.cancelInvitationAction.bind(this)}
                    locale={this.props.locale}
                    allFetched={this.state.allFetched}
                    isLoading={this.props.kutsuListLoading}
                />

                {this.state.confirmDeleteFor !== null && <Modal show={this.state.confirmDeleteFor !== null} onClose={this.cancelInvitationCancellation.bind(this)}
                                                               closeOnOuterClick={true}>
                    <div className="confirmation-modal">
                        <span className="oph-h2 oph-strong">{this.L['PERUUTA_KUTSU_VAHVISTUS']}</span>
                        <table>
                            <tbody>
                            <tr>
                                <th>{this.L['KUTSUT_NIMI_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor && this.state.confirmDeleteFor.etunimi} {this.state.confirmDeleteFor && this.state.confirmDeleteFor.sukunimi}</td>
                            </tr>
                            <tr>
                                <th>{this.L['KUTSUT_SAHKOPOSTI_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor && this.state.confirmDeleteFor.sahkoposti}</td>
                            </tr>
                            <tr>
                                <th>{this.L['KUTSUTUT_ORGANISAATIO_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor && this.state.confirmDeleteFor.organisaatiot.map(org =>
                                    <div className="kutsuOrganisaatio" key={org.oid}>{org.nimi[this.props.locale]}</div>)}</td>
                            </tr>
                            <tr>
                                <th>{this.L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO']}</th>
                                <td>{moment(this.state.confirmDeleteFor && this.state.confirmDeleteFor.aikaleima).format()}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="row">
                            <Button className="left action" action={this.cancelInvitationConfirmed.bind(this)}>
                                {this.L['PERUUTA_KUTSU']}
                            </Button>
                            <Button className="right cancel" action={this.cancelInvitationCancellation.bind(this)}>
                                {this.L['PERUUTA_KUTSUN_PERUUTTAMINEN']}
                            </Button>
                        </div>
                        <div className="clear"/>
                    </div>
                </Modal>}
            </div>);
    }

    cancelInvitationAction(r: Kutsu) {
        return () => {
            this.setState({confirmDeleteFor: r});
        };
    }

    cancelInvitationCancellation() {
        this.setState({confirmDeleteFor: null});
    }

    cancelInvitationConfirmed() {
        if (this.state.confirmDeleteFor) {
            this.props.deleteKutsu(this.state.confirmDeleteFor.id);
            this.setState({confirmDeleteFor: null});
        }
        this.fetchKutsus();
    }

    setView(newView: string) {
        this.setState({
            payload: {...this.state.payload, view: newView,},
        });
    }

    onHakutermiChange(target: {value: string}) {
        const hakutermi = target.value;
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.setState({payload: {...this.state.payload, searchTerm: hakutermi}});
        }
    }

    onOrganisaatioChange(organisaatioTarget: {value: string}) {
        const organisaatioOids = organisaatioTarget.value;
        this.setState({payload: {...this.state.payload, organisaatioOids},});
    }

    onKayttooikeusryhmaChange(newKayttooikeusId: number) {
        this.setState({payload: {...this.state.payload, kayttooikeusryhmaIds: newKayttooikeusId,}});
    }

    fetchKutsus(sort: ?Sort, shouldNotClear: ?boolean) {
        let sortBy = this.state.payload.sortBy;
        let direction = this.state.payload.direction;
        if (!shouldNotClear) {
            this.props.clearKutsuList();
            this.offset = this.defaultOffset;
        }
        else {
            this.offset += this.defaultLimit;
        }
        if (sort) {
            sortBy = this.kutsuTableHeaderToSort[sort.id];
            direction = sort.desc ? 'DESC' : 'ASC';
        }
        this.setState({payload: {...this.state.payload, sortBy, direction}},
            () => this.props.fetchKutsus(this.state.payload, this.offset, this.defaultLimit));
    }
}

