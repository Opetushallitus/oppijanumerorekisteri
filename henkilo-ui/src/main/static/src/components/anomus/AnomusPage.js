// @flow

import React from 'react'
import './AnomusPage.css'
import Loader from '../common/icons/Loader'
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm'
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus"
import WideGreenNotification from "../common/notifications/WideGreenNotification";
import type {Locale} from "../../types/locale.type";

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
    clearHaettuKayttooikeusryhma: (number) => void
};

type State = {
    parameters: Parameters,
    sorted: Array<any>,
    allFetched: boolean,
    page: number,
    kayttooikeus: any,
    showHylkaysSuccess: boolean,
    showHylkaysFailure: boolean,
    showHyvaksyminenSuccess: boolean,
    showHyvaksyminenFailure: boolean,
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
        showHylkaysSuccess: false,
        showHylkaysFailure: false,
        showHyvaksyminenSuccess: false,
        showHyvaksyminenFailure: false,
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
        const L = this.props.l10n[this.props.locale];
        return (
          <div className="anomus-table">
              <HaetutKayttooikeusRyhmatHakuForm onSubmit={this.onSubmit.bind(this)}/>
              { this.state.showHylkaysSuccess
              && <WideGreenNotification message={this.createNotificationMessage(L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS'])}
                                        closeAction={() => this.setState({showHylkaysSuccess: false})}/> }
              { this.state.showHyvaksyminenSuccess
              && <WideGreenNotification message={this.createNotificationMessage(L['HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_SUCCESS'])}
                                        closeAction={() => this.setState({showHyvaksyminenSuccess: false})}/> }
              { this.state.showHylkaysFailure
              && <WideGreenNotification message={this.createNotificationMessage(L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS'])}
                                        closeAction={() => this.setState({showHylkaysSuccess: false})}/> }
              { this.state.showHyvaksyminenFailure
              && <WideGreenNotification message={this.createNotificationMessage(L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS'])}
                                        closeAction={() => this.setState({showHyvaksyminenFailure: false})}/>}

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
            kayttoOikeudenTila === 'HYLATTY' ? this.setState({showHylkaysSuccess: true, anomusModifiedHenkilo: henkilo}) : this.setState({showHyvaksyminenSuccess: true, anomusModifiedHenkilo: henkilo});
            this.props.clearHaettuKayttooikeusryhma(id);
        } catch (error) {
            kayttoOikeudenTila === 'HYLATTY' ? this.setState({showHylkaysFailure: true, anomusModifiedHenkilo: henkilo}) : this.setState({showHyvaksyminenFailure: true, anomusModifiedHenkilo: henkilo});
            throw error;
        }
    };

    createNotificationMessage(notificationResult: string): string {
        const etunimet: string = this.state.anomusModifiedHenkilo.etunimet;
        const sukunimi = this.state.anomusModifiedHenkilo.sukunimi;
        const oid = this.state.anomusModifiedHenkilo.oid;
        return `Henkilön ${etunimet} ${sukunimi} (${oid}) ${notificationResult}`;
    }
}

export default AnomusPage;
