import React from 'react';
import PropTypes from 'prop-types'
import moment from 'moment';
import Modal from '../common/modal/Modal';
import Button from '../common/button/Button';
import './KutsututPage.css';
import KutsututTable from './KutsututTable';

export default class KutsututPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            confirmDeleteFor: null,
        };
    }

    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        kutsuList: PropTypes.array.isRequired,
        deleteKutsu: PropTypes.func.isRequired,
        fetchKutsus: PropTypes.func.isRequired,
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        const kutsuResponse = this.props.kutsuList;
        return (
            <div className="wrapper" id="kutsutut-page">
                <div className="header">
                    <h2>{L['KUTSUTUT_VIRKAILIJAT_OTSIKKO']}</h2>
                </div>
                {!kutsuResponse.loaded && <div className="loading">{L['LADATAAN']} </div>}
                {kutsuResponse.loaded && !kutsuResponse.result.length > 0
                && <div className="noResults">{L['EI_KUTSUJA']}</div>}
                {kutsuResponse.loaded && kutsuResponse.result.length > 0
                && <KutsututTable
                    fetchKutsus={this.props.fetchKutsus}
                    L={L}
                    kutsus={kutsuResponse.result}
                    cancelInvitation={this.cancelInvitationAction.bind(this)}
                    locale={this.props.locale}/>}

                {this.state.confirmDeleteFor !== null && <Modal show={this.state.confirmDeleteFor !== null} onClose={this.cancelInvitationCancellation.bind(this)}
                                                               closeOnOuterClick={true}>
                    <div className="confirmation-modal">
                        <h2>{L['PERUUTA_KUTSU_VAHVISTUS']}</h2>
                        <table>
                            <tbody>
                            <tr>
                                <th>{L['KUTSUT_NIMI_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor.etunimi} {this.state.confirmDeleteFor.sukunimi}</td>
                            </tr>
                            <tr>
                                <th>{L['KUTSUT_SAHKOPOSTI_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor.sahkoposti}</td>
                            </tr>
                            <tr>
                                <th>{L['KUTSUTUT_ORGANISAATIO_OTSIKKO']}</th>
                                <td>{this.state.confirmDeleteFor.organisaatiot.map(org =>
                                    <div className="kutsuOrganisaatio" key={org.oid}>{org.nimi[this.props.locale]}</div>)}</td>
                            </tr>
                            <tr>
                                <th>{L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO']}</th>
                                <td>{moment(new Date(this.state.confirmDeleteFor.aikaleima)).format()}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="row">
                            <Button className="left action" action={this.cancelInvitationConfirmed.bind(this)}>
                                {L['PERUUTA_KUTSU']}
                            </Button>
                            <Button className="right cancel" action={this.cancelInvitationCancellation.bind(this)}>
                                {L['PERUUTA_KUTSUN_PERUUTTAMINEN']}
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
}

