import React from 'react';
import PropTypes from 'prop-types'
import moment from 'moment';
import Modal from '../common/modal/Modal';
import Button from '../common/button/Button';
import './KutsututPage.css';
import KutsututTable from './KutsututTable';
import BooleanRadioButtonGroup from "../common/radiobuttongroup/BooleanRadioButtonGroup";
import DelayedSearchInput from "../henkilohaku/DelayedSearchInput";
import OphSelect from "../common/select/OphSelect";
import OrganisaatioOphSelect from "../common/select/OrganisaatioOphSelect";

export default class KutsututPage extends React.Component {

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.defaultLimit = 20;
        this.defaultOffset = 0;

        this.state = {
            confirmDeleteFor: null,
            getOwnKutsus: false,
            hakutermi: '',
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
    };

    render() {
        const kutsuResponse = this.props.kutsus;
        return (
            <div className="wrapper" id="kutsutut-page">
                <div className="header">
                    <span className="oph-h2 oph-strong">{this.L['KUTSUTUT_VIRKAILIJAT_OTSIKKO']}</span>
                    <span id="radiator">
                        <BooleanRadioButtonGroup value={this.state.getOwnKutsus}
                                                 onChange={() => this.toggleFetchAll(!this.state.getOwnKutsus)}
                                                 trueLabel={this.L['KUTSUTUT_KAIKKI_BUTTON']}
                                                 falseLabel={this.L['KUTSUTUT_OMAT_BUTTON']} />
                    </span>
                </div>
                <DelayedSearchInput setSearchQueryAction={this.onHakutermiChange.bind(this)}
                                    defaultNameQuery={this.state.hakutermi}
                                    placeholder={this.L['KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO']}
                                    loading={this.props.kutsuListLoading} />
                <OrganisaatioOphSelect onOrganisaatioChange={this.onOrganisaatioChange.bind(this)}
                                       organisaatiot={this.props.organisaatiot} />
                {!kutsuResponse.loaded && <div className="loading">{this.L['LADATAAN']} </div>}
                {kutsuResponse.loaded && !kutsuResponse.result.length > 0
                && <div className="noResults">{this.L['EI_KUTSUJA']}</div>}
                {kutsuResponse.loaded && kutsuResponse.result.length > 0
                && <KutsututTable
                    fetchKutsus={this.props.fetchKutsus}
                    L={this.L}
                    kutsus={kutsuResponse.result}
                    cancelInvitation={this.cancelInvitationAction.bind(this)}
                    locale={this.props.locale}/>}

                {this.state.confirmDeleteFor !== null && <Modal show={this.state.confirmDeleteFor !== null} onClose={this.cancelInvitationCancellation.bind(this)}
                                                               closeOnOuterClick={true}>
                    <div className="confirmation-modal">
                        <span className="oph-h2 oph-strong">{this.L['PERUUTA_KUTSU_VAHVISTUS']}</span>
                        <table>
                            <tbody>
                            <tr>
                                <th>{this.L['KUTSUT_NIMI_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor.etunimi} {this.state.confirmDeleteFor.sukunimi}</td>
                            </tr>
                            <tr>
                                <th>{this.L['KUTSUT_SAHKOPOSTI_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor.sahkoposti}</td>
                            </tr>
                            <tr>
                                <th>{this.L['KUTSUTUT_ORGANISAATIO_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor.organisaatiot.map(org =>
                                    <div className="kutsuOrganisaatio" key={org.oid}>{org.nimi[this.props.locale]}</div>)}</td>
                            </tr>
                            <tr>
                                <th>{this.L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO']}</th>
                                <td>{moment(new Date(this.state.confirmDeleteFor.aikaleima)).format()}</td>
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

    cancelInvitationAction(r) {
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
        this.props.fetchKutsus();
    }

    toggleFetchAll(getOwnKutsus) {
        this.setState({getOwnKutsus: getOwnKutsus});
        this.props.fetchKutsus(undefined, undefined, !getOwnKutsus, this.state.hakutermi, this.state.organisaatio.value);
    }

    onHakutermiChange(event) {
        const hakutermi = event.value;
        this.setState({hakutermi: hakutermi});
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.props.fetchKutsus(undefined, undefined, !this.state.getOwnKutsus, hakutermi, this.state.organisaatio.value);
        }
    }

    onOrganisaatioChange(organisaatio) {
        this.setState({organisaatio,});
        const organisaatioOid = organisaatio.value;
        this.props.fetchKutsus(undefined, undefined, !this.state.getOwnKutsus, this.state.hakutermi, organisaatioOid);
    }

}

