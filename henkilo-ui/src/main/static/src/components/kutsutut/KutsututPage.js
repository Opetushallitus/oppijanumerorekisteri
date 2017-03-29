import React from 'react';
import dateformat from 'dateformat'

import Modal from '../common/modal/Modal'
import Button from '../common/button/Button'
import SortByHeader from '../common/sort-by-header/SortByHeader'
import './KutsututPage.css'
import locale from '../../configuration/locale'


const KutsututPage = React.createClass({
    getInitialState: function() {
        this.tableState = {
            sortBy: 'AIKALEIMA',
            direction: 'DESC'
        };
        return {
            confirmDeleteFor: null,
        };
    },

    render: function() {
        const L = this.props.l10n[locale];
        const kutsuResponse = this.props.kutsuList;
        return (
            <div className="wrapper">
                <div className="header">
                    <h2>{L['KUTSUTUT_VIRKAILIJAT_OTSIKKO']}</h2>
                </div>
                {!kutsuResponse.loaded
                && <div className="loading">{L['LADATAAN']}
                </div>}
                {kutsuResponse.loaded && !kutsuResponse.result.length > 0
                && <div className="noResults">{L['EI_KUTSUJA']}</div>}
                {kutsuResponse.loaded && kutsuResponse.result.length > 0
                && <div className="results">
                    <table>
                        <thead>
                        <tr>
                            <SortByHeader by="NIMI" state={this.tableState} onChange={this.changeOrder}>
                                {L['KUTSUT_NIMI_OTSIKKO']}
                            </SortByHeader>
                            <SortByHeader by="SAHKOPOSTI" state={this.tableState} onChange={this.changeOrder}>
                                {L['KUTSUT_SAHKOPOSTI_OTSIKKO']}
                            </SortByHeader>
                            <SortByHeader by="ORGANISAATIO" state={this.tableState} onChange={this.changeOrder}>
                                {L['KUTSUTUT_ORGANISAATIO_OTSIKKO']}
                            </SortByHeader>
                            <SortByHeader by="AIKALEIMA" state={this.tableState} onChange={this.changeOrder}>
                                {L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO']}
                            </SortByHeader>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {kutsuResponse.result.map(kutsu => <tr key={kutsu.id}>
                            <td>
                                {kutsu.etunimi} {kutsu.sukunimi}
                            </td>
                            <td>
                                {kutsu.sahkoposti}
                            </td>
                            <td>
                                {kutsu.organisaatiot.map(org =>
                                    <div className="kutsuOrganisaatio" key={org.oid}>{org.nimi[this.props.locale]}</div>)}
                            </td>
                            <td>
                                {dateformat(new Date(kutsu.aikaleima), L['PVM_FORMAATTI'])}
                            </td>
                            <th>
                                {kutsu.tila === 'AVOIN' && <Button className="cancel" action={this.cancelInvitationAction(kutsu)}>{L['PERUUTA_KUTSU']}</Button>}
                            </th>
                        </tr>)}
                        </tbody>
                    </table>
                </div>}

                {this.state.confirmDeleteFor != null && <Modal show={this.state.confirmDeleteFor != null} onClose={this.cancelInvitationCancellation}
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
                                <td>{dateformat(new Date(this.state.confirmDeleteFor.aikaleima), L['PVM_FORMAATTI'])}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="row">
                            <Button className="left action" action={this.cancelInvitationConfirmed}>
                                {L['PERUUTA_KUTSU']}
                            </Button>
                            <Button className="right cancel" action={this.cancelInvitationCancellation}>
                                {L['PERUUTA_KUTSUN_PERUUTTAMINEN']}
                            </Button>
                        </div>
                        <div className="clear"></div>
                    </div>
                </Modal>}
            </div>);
    },

    changeOrder: function(orderBy, direction) {
        this.tableState.sortBy = orderBy;
        this.tableState.direction = direction;
        this.props.fetchKutsus(orderBy, direction);
    },

    cancelInvitationAction: function(r) {
        return () => {
            this.setState({confirmDeleteFor: r});
        };
    },

    cancelInvitationCancellation: function() {
        this.setState({confirmDeleteFor: null});
    },

    cancelInvitationConfirmed: function() {
        if (this.state.confirmDeleteFor) {
            this.props.deleteKutsu(this.state.confirmDeleteFor.id);
            this.setState({confirmDeleteFor: null});
        }
    },
});

export default KutsututPage;