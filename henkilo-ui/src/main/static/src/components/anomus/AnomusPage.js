// @flow

import React from 'react'
import './AnomusPage.css'
import Loader from '../common/icons/Loader'
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm'
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus"
import type {Locale} from "../../types/locale.type";
import type {GlobalNotificationConfig} from "../../types/notification.types";
import { NOTIFICATIONTYPES } from "../common/Notification/notificationtypes";

/**
 * Haettujen käyttöoikeusryhmien haku ja myöntäminen/hylkääminen.
 */

type Parameters = {
    orderBy: string,
    limit: number,
    showOwnAnomus: boolean,
    adminView: boolean,
    anomuksenTilat: Array<string>,
    kayttoOikeudenTilas: Array<string>
}

type Props = {
    l10n: any,
    locale: Locale,
    kayttooikeusAnomus: any,
    organisaatioCache: any,
    clearHaetutKayttooikeusryhmat: () => void,
    fetchAllOrganisaatios: () => void,
    fetchHaetutKayttooikeusryhmat: (Parameters) => void,
    haetutKayttooikeusryhmatLoading: boolean,
    fetchAllRyhmas: () => void,
    isAdmin: boolean,
    updateHaettuKayttooikeusryhmaInAnomukset: (number, string, string, string, string) => Promise<any>,
    clearHaettuKayttooikeusryhma: (number) => void,
    addGlobalNotification: (GlobalNotificationConfig) => void
};

type State = {
    parameters: Parameters,
    sorted: Array<any>,
    allFetched: boolean,
    page: number,
    kayttooikeus: any,
    anomusModifiedHenkilo: any
}

class AnomusPage extends React.Component<Props, State> {

    defaultLimit = 20;
    defaultOffset = 0;
    initialised = false;

    state: State = {
        parameters: {
            orderBy: 'ANOTTU_PVM_DESC',
            limit: this.defaultLimit,
            showOwnAnomus: false,
            adminView: this.props.isAdmin,
            anomuksenTilat: ['ANOTTU'],
            kayttoOikeudenTilas: ['ANOTTU'],
        },
        sorted: [{id: 'ANOTTU_PVM', desc: true}],
        allFetched: false,
        page: 0,
        kayttooikeus: {},
        anomusModifiedHenkilo: undefined
    };

    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat(this.state.parameters);
        this.props.fetchAllRyhmas();
    };

    componentWillReceiveProps(nextProps: Props) {
        if (!nextProps.haetutKayttooikeusryhmatLoading) {
            this.setState({
                allFetched: nextProps.kayttooikeusAnomus.length < this.defaultLimit * (this.state.page + 1),
            });
        }
        if (!this.props.haetutKayttooikeusryhmatLoading) {
            this.initialised = true;
        }
    };

    render() {
        return (
          <div className="anomus-table">
              <HaetutKayttooikeusRyhmatHakuForm onSubmit={this.onSubmit.bind(this)}/>

              {
                  this.props.haetutKayttooikeusryhmatLoading && !this.initialised
                      ? <Loader />
                      : <div>
                          <HenkiloViewOpenKayttooikeusanomus
                              kayttooikeus={{
                                  kayttooikeusAnomus: this.props.kayttooikeusAnomus,
                                  grantableKayttooikeus: {},
                                  grantableKayttooikeusLoading: true,
                              }}
                              l10n={this.props.l10n}
                              locale={this.props.locale}
                              organisaatioCache={this.props.organisaatioCache}
                              updateHaettuKayttooikeusryhma={this.updateHaettuKayttooikeusryhma.bind(this)}
                              isAnomusView={true}
                              manualSortSettings={{
                                  manual: true,
                                  defaultSorted: this.state.sorted,
                                  onFetchData: this.onTableFetch.bind(this)
                              }}
                              fetchMoreSettings={{
                                  isActive: !this.state.allFetched && !this.props.haetutKayttooikeusryhmatLoading,
                                  fetchMoreAction: this.onSubmitWithoutClear.bind(this),
                              }}
                              tableLoading={this.props.haetutKayttooikeusryhmatLoading}
                              piilotaOtsikko={true}
                              striped />
                      </div>
              }
          </div>
        );
    };

    onTableFetch(tableState: any) {
        const sort = tableState.sorted[0];
        const stateSort = this.state.sorted[0];
        // Update sort state
        if(sort) {
            this.setState({
                    sorted: [Object.assign({}, sort)],
                },
                // If sort state changed fetch new data
                () => {if(!stateSort || sort.id !== stateSort.id || sort.desc !== stateSort.desc) {
                    this.onSubmit();
                }});

        }
    };

    onSubmitWithoutClear(criteria: any) {
        this.onSubmit(criteria, true);
    };

    onSubmit(criteria?: any, shouldNotClear?: boolean) {
        if(!shouldNotClear) {
            this.props.clearHaetutKayttooikeusryhmat();
        }
        const parameters = Object.assign({}, this.state.parameters, criteria);
        parameters.orderBy = this.state.sorted.length
            ? (this.state.sorted[0].desc ? this.state.sorted[0].id + '_DESC' : this.state.sorted[0].id + "_ASC")
            : this.state.parameters.orderBy;
        parameters.offset = shouldNotClear ? this.defaultLimit * (this.state.page+1) : this.defaultOffset;
        this.setState({
            parameters: parameters,
            page: shouldNotClear ? this.state.page+1 : 0,
            allFetched: shouldNotClear ? this.state.allFetched : false,
        }, () => this.props.fetchHaetutKayttooikeusryhmat(parameters));
    };

    async updateHaettuKayttooikeusryhma(id: number, kayttoOikeudenTila: string, alkupvm: string, loppupvm: string, henkilo: any, hylkaysperuste: string) {
        try {
            await this.props.updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, hylkaysperuste);
            this.setState({anomusModifiedHenkilo: henkilo});
            const notificationMessageKey = kayttoOikeudenTila === 'HYLATTY' ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS' : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_SUCCESS';
            this.props.addGlobalNotification({
                key: `${henkilo.oid}_${id}_${notificationMessageKey}`,
                type: NOTIFICATIONTYPES.SUCCESS,
                title: this.createNotificationMessage(henkilo, notificationMessageKey),
                autoClose: 10000
            });
            this.props.clearHaettuKayttooikeusryhma(id);
        } catch (error) {
            const notificationMessageKey = kayttoOikeudenTila === 'HYLATTY' ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_FAILURE' : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_FAILURE';
            this.props.addGlobalNotification({
                key: `${henkilo.oid}_${id}_${notificationMessageKey}`,
                type: NOTIFICATIONTYPES.ERROR,
                title: this.createNotificationMessage(henkilo, notificationMessageKey),
                autoClose: 10000
            });
            throw error;
        }
    };

    createNotificationMessage(henkilo: any, messageKey: string): string {
        const message = this.props.l10n[this.props.locale][messageKey];
        const henkiloLocalized = this.props.l10n[this.props.locale]['HENKILO_KAYTTOOIKEUSANOMUS_NOTIFICATIONS_HENKILON'];
        const etunimet = henkilo.etunimet;
        const sukunimi = henkilo.sukunimi;
        const oid = henkilo.oid;
        return `${henkiloLocalized} ${etunimet} ${sukunimi} (${oid}) ${message}`;
    }
}

export default AnomusPage;
