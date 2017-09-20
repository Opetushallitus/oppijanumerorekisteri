import React from 'react'
import PropTypes from 'prop-types'
import './AnomusPage.css'
import Loader from '../common/icons/Loader'
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm'
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus"
import WideGreenNotification from "../common/notifications/WideGreenNotification";

/**
 * Haettujen käyttöoikeusryhmien haku ja myöntäminen/hylkääminen.
 */
class AnomusPage extends React.Component {
    constructor(props) {
        super(props);

        this.defaultLimit = 20;
        this.defaultOffset = 0;

        this.state = {
            parameters: {
                orderBy: 'ANOTTU_PVM_DESC',
                limit: this.defaultLimit,
                showOwnAnomus: false,
                adminView: props.isAdmin,
                anomuksenTilat: ['ANOTTU'],
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
    };

    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        kayttooikeusAnomus: PropTypes.array.isRequired,
        organisaatioCache: PropTypes.object.isRequired,
        clearHaetutKayttooikeusryhmat: PropTypes.func.isRequired,
        fetchAllOrganisaatios: PropTypes.func.isRequired,
        fetchHaetutKayttooikeusryhmat: PropTypes.func.isRequired,
        isAdmin: PropTypes.bool.isRequired,
    };

    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat(this.state.parameters);
        // For organisation filtering. Should fetch only user's organisations for normal users.
        if(!this.props.isAdmin) {
            this.props.fetchOmattiedotOrganisaatios();
        }
        this.props.fetchAllOrganisaatios();
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            allFetched: !nextProps.haetutKayttooikeusryhmatLoading
            && (nextProps.kayttooikeusAnomus.length < this.defaultLimit
            || nextProps.kayttooikeusAnomus.length === this.props.kayttooikeusAnomus.length),
        });

        if(!this.props.haetutKayttooikeusryhmatLoading) {
            this.initialised = true;
        }
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return (
          <div className="anomus-table">
            <HaetutKayttooikeusRyhmatHakuForm {...this.props} onSubmit={this.onSubmit.bind(this)}/>
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

    onTableFetch(tableState, instance) {
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

    onSubmitWithoutClear(criteria) {
        this.onSubmit(criteria, true);
    };

    onSubmit(criteria, shouldNotClear) {
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
        }, () => this.props.fetchHaetutKayttooikeusryhmat(parameters));
    };

    async updateHaettuKayttooikeusryhma(id, kayttoOikeudenTila, alkupvm, loppupvm, oidHenkilo, henkilo) {
        try {
            await this.props.updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, this.state.parameters);
            kayttoOikeudenTila === 'HYLATTY' ? this.setState({showHylkaysSuccess: true, anomusModifiedHenkilo: henkilo}) : this.setState({showHyvaksyminenSuccess: true, anomusModifiedHenkilo: henkilo});
            this.props.clearHaettuKayttooikeusryhma(id);
        } catch (error) {
            kayttoOikeudenTila === 'HYLATTY' ? this.setState({showHylkaysFailure: true, anomusModifiedHenkilo: henkilo}) : this.setState({showHyvaksyminenFailure: true, anomusModifiedHenkilo: henkilo});
        }
    };

    showNotification(key) {
        this.setState({[key]: true});
    }

    createNotificationMessage(notificationResult) {
        return `Henkilön ${this.state.anomusModifiedHenkilo.etunimet} ${this.state.anomusModifiedHenkilo.sukunimi} (${this.state.anomusModifiedHenkilo.oid}) ${notificationResult}`;
    }
}

export default AnomusPage;
