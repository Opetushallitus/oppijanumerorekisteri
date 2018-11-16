// @flow

import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import './KutsututTable.css';
import Table from '../common/table/Table';
import Button from '../common/button/Button';
import {renewKutsu} from "../../actions/kutsu.actions";
import { toLocalizedText } from '../../localizabletext';
import {NOTIFICATIONTYPES} from "../common/Notification/notificationtypes";
import type {Localisations} from "../../types/localisation.type";
import type {GlobalNotificationConfig} from "../../types/notification.types";
import {addGlobalNotification} from "../../actions/notification.actions";
import type {Locale} from "../../types/locale.type";

type Props = {
    kutsus: Array<any>,
    cancelInvitation: () => any,
    isLoading: boolean,
    allFetched: boolean,
    addGlobalNotification: (GlobalNotificationConfig) => any,
    renewKutsu: (number) => void,
    L: Localisations,
    fetchKutsus: (any, ?boolean) => void,
    cancelInvitation: (any) => any,
    locale: Locale
}

type State = {
    sorted: Array<any>
}

class KutsututTable extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            sorted: [{id: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO', desc: true}],
        };
    }

    render() {
        const L = this.props.L;
        const headings = [{ key: 'KUTSUT_NIMI_OTSIKKO', label: L['KUTSUT_NIMI_OTSIKKO'] },
            { key: 'KUTSUT_SAHKOPOSTI_OTSIKKO', label: L['KUTSUT_SAHKOPOSTI_OTSIKKO'] },
            { key: 'KUTSUTUT_ORGANISAATIO_OTSIKKO', label: L['KUTSUTUT_ORGANISAATIO_OTSIKKO'], notSortable: true, },
            { key: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO', label: L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO'] },
            { key: 'KUTSUTUT_LAHETA_UUDELLEEN', label: L['KUTSUTUT_LAHETA_UUDELLEEN'], notSortable: true},
            { key: 'KUTSU_PERUUTA', label: L['KUTSUTUT_PERUUTA_KUTSU'], notSortable: true},
        ];
        
        const data = this.props.kutsus.map( kutsu => ({
            KUTSUT_NIMI_OTSIKKO: this.createNimiCell(kutsu),
            KUTSUT_SAHKOPOSTI_OTSIKKO: this.createSahkopostiCell(kutsu),
            KUTSUTUT_ORGANISAATIO_OTSIKKO: this.createOrganisaatiotCell(kutsu),
            KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO: this.createKutsuLahetettyCell(kutsu),
            KUTSUTUT_LAHETA_UUDELLEEN: this.createResendCell(kutsu),
            KUTSU_PERUUTA: this.createPeruutaCell(kutsu)
        }));
        
        return <div className="kutsututTableWrapper">
            <Table headings={headings}
                   noDataText={this.props.L['KUTSUTUT_VIRKAILIJAT_TYHJA']}
                   data={data}
                   striped
                   manual={true}
                   defaultSorted={this.state.sorted}
                   onFetchData={this.onTableFetch.bind(this)}
                   fetchMoreSettings={{
                       isActive: !this.props.allFetched && !this.props.isLoading,
                       fetchMoreAction: this.onSubmitWithoutClear.bind(this),
                   }}
                   tableLoading={this.props.isLoading}
            />
        </div>;
    }

    createNimiCell(kutsu) {
        return `${kutsu.etunimi} ${kutsu.sukunimi}`;
    }

    createSahkopostiCell(kutsu) {
        return kutsu.sahkoposti;
    }

    createOrganisaatiotCell(kutsu) {
        return (<div>
                { kutsu.organisaatiot.map(org => <div key={org.organisaatioOid}>{toLocalizedText(this.props.locale, org.nimi) || org.organisaatioOid}</div>)}
                </div>);
    }

    createKutsuLahetettyCell(kutsu) {
        const sent = moment(new Date(kutsu.aikaleima));
        return (<span>{sent.format('DD/MM/YYYY H:mm')} {sent.add(1, 'months').isBefore(moment()) ? <span className="oph-red">{this.props.L['KUTSUTUT_VIRKAILIJAT_KUTSU_VANHENTUNUT']}</span> : null}</span>);
    }

    createResendCell(kutsu) {
        const resendAction = async () => {
            await this.props.renewKutsu(kutsu.id);
            this.props.addGlobalNotification({
                key: 'KUTSU_CONFIRMATION_SUCCESS',
                type: NOTIFICATIONTYPES.SUCCESS, 
                autoClose: 10000,
                title: this.props.L['KUTSU_LUONTI_ONNISTUI']
            });
            this.props.fetchKutsus(this.state.sorted[0]);
        };
        return kutsu.tila === 'AVOIN' &&
            <Button
                    action={resendAction}>
                {this.props.L['KUTSUTUT_LAHETA_UUDELLEEN_NAPPI']}
            </Button>
    }

    createPeruutaCell(kutsu) {
        return kutsu.tila === 'AVOIN' &&
            <Button cancel
                    action={this.props.cancelInvitation(kutsu)}>
                {this.props.L['KUTSUTUT_PERUUTA_KUTSU_NAPPI']}
            </Button>
    }

    onTableFetch(tableState, instance) {
        const newSort = tableState.sorted[0];
        const stateSort = this.state.sorted[0];
        // Update sort state
        if(newSort) {
            this.setState({
                    sorted: [Object.assign({}, newSort)],
                },
                // If sort state changed fetch new data
                () => {if(!stateSort || newSort.id !== stateSort.id || newSort.desc !== stateSort.desc) {
                    this.props.fetchKutsus(newSort);
                }});

        }
    }

    onSubmitWithoutClear() {
        this.props.fetchKutsus(this.state.sorted[0], true);
    }

}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
});

export default connect(mapStateToProps, {renewKutsu, addGlobalNotification})(KutsututTable);
