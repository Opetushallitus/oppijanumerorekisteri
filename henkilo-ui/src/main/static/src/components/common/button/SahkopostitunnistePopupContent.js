// @flow

import React from 'react';
import {urls} from 'oph-urls-js';
import {http} from '../../../http';
import './HakaPopupContent.css';
import type {L} from "../../../types/localisation.type";
import Loader from "../icons/Loader";
import {connect} from "react-redux";
import {addGlobalNotification} from "../../../actions/notification.actions";
import type {GlobalNotificationConfig} from "../../../types/notification.types";
import {NOTIFICATIONTYPES} from "../Notification/notificationtypes";
import type {Identification} from "../../../types/domain/oppijanumerorekisteri/Identification.types";

type Props = {
    henkiloOid: string,
    L: L,
    addGlobalNotification: (GlobalNotificationConfig) => any
}

type State = {
    sahkopostitunnisteet: Array<string>,
    newTunniste: string,
    loading: boolean
}

class SahkopostitunnistePopupContent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            sahkopostitunnisteet: [],
            newTunniste: '',
            loading: false
        }
    }

    async componentDidMount() {
        this.getSahkopostitunnisteet();
    }

    render() {
        return (<div className="hakapopupcontent">
            <ul>
                {
                    this.state.loading ? <Loader /> : this.state.sahkopostitunnisteet.length > 0 ? this.state.sahkopostitunnisteet.map(sahkopostitunniste =>
                    (<li className="tag" key={sahkopostitunniste}><span>{sahkopostitunniste}</span> <a className="remove"
                                                                                           onClick={ () => this.removeSahkopostitunniste(sahkopostitunniste)}>{this.props.L['POISTA']}</a>
                    </li>)) : <span className="oph-h4 oph-strong hakapopup">{this.props.L['EI_SAHKOPOSTITUNNISTEITA']}</span> }
            </ul>
            <div className="oph-field oph-field-is-required">
                <input type="text"
                       className="oph-input haka-input"
                       aria-required="true"
                       placeholder="Lisää uusi tunnus"
                       value={this.state.newTunniste}
                       onChange={this.handleChange.bind(this)}
                       onKeyPress={ (e) => e.key === 'Enter' ? this.addSahkopostitunniste() : null}/>
                <button className="save oph-button oph-button-primary"
                        onClick={() => this.addSahkopostitunniste()}>{this.props.L['TALLENNA_TUNNUS']}</button>
            </div>
        </div>);
    }

    handleChange(event: SyntheticEvent<HTMLButtonElement>) {
        this.setState({newTunniste: event.currentTarget.value});
    }

    async addSahkopostitunniste() {
        if (this.state.newTunniste.length > 0) {

            const url = urls.url('oppijanumerorekisteri-service.henkilo.identification', this.props.henkiloOid);
            try {
                this.setState({loading: true});
                const newTunnisteet = await http.post(url, this.stringToIdentification(this.state.newTunniste));
                this.setState({newTunniste: '', sahkopostitunnisteet: this.identificationsToStrings(newTunnisteet), loading: false});
            } catch (error) {
                this.setState({loading: false});
                this.props.addGlobalNotification({
                    key: 'SAVE_SAHKOPOSTITUNNISTEET',
                    type: NOTIFICATIONTYPES.ERROR,
                    autoClose: 10000,
                    title: this.props.L['SAHKOPOSTITUNNISTE_TALLENNUS_VIRHE']
                });
                throw error;
            }
        }
    }

    async removeSahkopostitunniste(tunniste: string) {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.identification.remove', this.props.henkiloOid, 'email', tunniste );
        try {
            this.setState({loading: true});
            const sahkopostitunnisteet = await http.delete(url);
            this.setState({loading: false, sahkopostitunnisteet: this.identificationsToStrings(sahkopostitunnisteet)});
        } catch (error) {
            this.setState({loading: false});
            this.props.addGlobalNotification({
                key: 'REMOVE_SAHKOPOSTITUNNISTEET',
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
                title: this.props.L['SAHKOPOSTITUNNISTE_POISTO_VIRHE']
            });
            throw error;
        }
    }

    async getSahkopostitunnisteet() {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.identification', this.props.henkiloOid);
        try {
            const tunnisteet: Array<Identification> = await http.get(url);
            const sahkopostitunnisteet: Array<string> = this.identificationsToStrings(tunnisteet);
            this.setState({loading: false, sahkopostitunnisteet});
        } catch (error) {
            this.setState({loading: false});
            this.props.addGlobalNotification({
                key: 'GET_SAHKOPOSTITUNNISTEET',
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
                title: this.props.L['SAHKOPOSTITUNNISTE_HAKU_VIRHE']
            });
            throw error;
        }
    }

    identificationsToStrings(tunnisteet: Array<Identification>): Array<string> {
        return tunnisteet.filter( (tunniste: Identification) => tunniste.idpEntityId === 'email')
            .map( (tunniste: Identification) => tunniste.identifier);
    }

    stringToIdentification(tunniste: string): Identification {
        return {identifier: tunniste, idpEntityId: 'email'};
    }


}

export default connect(() => ({}), {addGlobalNotification})(SahkopostitunnistePopupContent)
