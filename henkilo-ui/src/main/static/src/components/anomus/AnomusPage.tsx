import React from 'react';
import '../../oph-table.css';
import Loader from '../common/icons/Loader';
import HaetutKayttooikeusRyhmatHakuForm, { Criteria } from './HaetutKayttooikeusRyhmatHakuForm';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import { Locale } from '../../types/locale.type';
import { GlobalNotificationConfig } from '../../types/notification.types';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { getEmptyKayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { OrganisaatioCache } from '../../reducers/organisaatio.reducer';
import { OrganisaatioCriteria } from '../../types/domain/organisaatio/organisaatio.types';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { L10n } from '../../types/localisation.type';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { SortingState } from '@tanstack/react-table';

/**
 * Haettujen käyttöoikeusryhmien haku ja myöntäminen/hylkääminen.
 */
export type FetchHaetutKayttooikeusryhmatParameters = {
    orderBy: string;
    limit: number;
    showOwnAnomus: boolean;
    adminView: boolean;
    anomuksenTilat: Array<string>;
    kayttoOikeudenTilas: Array<string>;
    offset?: number;
};

type Props = {
    l10n: L10n;
    locale: Locale;
    kayttooikeusAnomus: HaettuKayttooikeusryhma[];
    organisaatioCache: OrganisaatioCache;
    clearHaetutKayttooikeusryhmat: () => void;
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void;
    fetchHaetutKayttooikeusryhmat: (arg0: FetchHaetutKayttooikeusryhmatParameters) => void;
    haetutKayttooikeusryhmatLoading: boolean;
    fetchAllRyhmas: () => void;
    isAdmin: boolean;
    updateHaettuKayttooikeusryhmaInAnomukset: (
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
        hylkaysperuste: string
    ) => void;
    clearHaettuKayttooikeusryhma: (arg0: number) => void;
    addGlobalNotification: (arg0: GlobalNotificationConfig) => void;
};

type State = {
    parameters: FetchHaetutKayttooikeusryhmatParameters;
    sorted: SortingState;
    allFetched: boolean;
    page: number;
};

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
            kayttoOikeudenTilas: [KAYTTOOIKEUDENTILA.ANOTTU],
        },
        sorted: [{ id: 'ANOTTU_PVM', desc: true }],
        allFetched: false,
        page: 0,
    };

    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat(this.state.parameters);
        this.props.fetchAllRyhmas();
        this.props.fetchAllOrganisaatios();
    }

    componentWillReceiveProps(nextProps: Props) {
        if (!nextProps.haetutKayttooikeusryhmatLoading) {
            this.setState({
                allFetched: nextProps.kayttooikeusAnomus.length < this.defaultLimit * (this.state.page + 1),
            });
        }
        if (!this.props.haetutKayttooikeusryhmatLoading) {
            this.initialised = true;
        }
    }

    render() {
        return (
            <div className="oph-table">
                <HaetutKayttooikeusRyhmatHakuForm onSubmit={this.onSubmit.bind(this)} />

                {this.props.haetutKayttooikeusryhmatLoading && !this.initialised ? (
                    <Loader />
                ) : (
                    <div>
                        <HenkiloViewOpenKayttooikeusanomus
                            isOmattiedot={false}
                            kayttooikeus={{
                                ...getEmptyKayttooikeusRyhmaState(),
                                kayttooikeusAnomus: this.props.kayttooikeusAnomus,
                                grantableKayttooikeus: {},
                                grantableKayttooikeusLoading: true,
                            }}
                            updateHaettuKayttooikeusryhmaAlt={this.updateHaettuKayttooikeusryhma.bind(this)}
                            fetchMoreSettings={{
                                isActive: !this.state.allFetched && !this.props.haetutKayttooikeusryhmatLoading,
                                fetchMoreAction: this.onSubmitWithoutClear.bind(this),
                            }}
                            onSortingChange={this.onSortingChange.bind(this)}
                            tableLoading={this.props.haetutKayttooikeusryhmatLoading}
                            piilotaOtsikko={true}
                        />
                    </div>
                )}
            </div>
        );
    }

    onSortingChange(sorting: SortingState) {
        this.setState({ sorted: [sorting[0]] }, () => this.onSubmit());
    }

    onSubmitWithoutClear(criteria?: Criteria) {
        this.onSubmit(criteria, true);
    }

    onSubmit(criteria?: Criteria, shouldNotClear?: boolean) {
        if (!shouldNotClear) {
            this.props.clearHaetutKayttooikeusryhmat();
        }
        const parameters = Object.assign({}, this.state.parameters, criteria);
        parameters.orderBy = this.state.sorted.length
            ? this.state.sorted[0].desc
                ? this.state.sorted[0].id + '_DESC'
                : this.state.sorted[0].id + '_ASC'
            : this.state.parameters.orderBy;
        parameters.offset = shouldNotClear ? this.defaultLimit * (this.state.page + 1) : this.defaultOffset;
        this.setState(
            {
                parameters: parameters,
                page: shouldNotClear ? this.state.page + 1 : 0,
                allFetched: shouldNotClear ? this.state.allFetched : false,
            },
            () => this.props.fetchHaetutKayttooikeusryhmat(parameters)
        );
    }

    updateHaettuKayttooikeusryhma(
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
        henkilo: HenkilonNimi,
        hylkaysperuste?: string
    ): void {
        try {
            this.props.updateHaettuKayttooikeusryhmaInAnomukset(
                id,
                kayttoOikeudenTila,
                alkupvm,
                loppupvm,
                hylkaysperuste
            );
            const notificationMessageKey =
                kayttoOikeudenTila === KAYTTOOIKEUDENTILA.HYLATTY
                    ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS'
                    : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_SUCCESS';
            this.props.addGlobalNotification({
                key: `${henkilo.oid}_${id}_${notificationMessageKey}`,
                type: NOTIFICATIONTYPES.SUCCESS,
                title: this.createNotificationMessage(henkilo, notificationMessageKey),
                autoClose: 10000,
            });
            this.props.clearHaettuKayttooikeusryhma(id);
        } catch (error) {
            const notificationMessageKey =
                kayttoOikeudenTila === KAYTTOOIKEUDENTILA.HYLATTY
                    ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_FAILURE'
                    : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_FAILURE';
            this.props.addGlobalNotification({
                key: `${henkilo.oid}_${id}_${notificationMessageKey}`,
                type: NOTIFICATIONTYPES.ERROR,
                title: this.createNotificationMessage(henkilo, notificationMessageKey),
                autoClose: 10000,
            });
            throw error;
        }
    }

    createNotificationMessage(henkilo: HenkilonNimi, messageKey: string): string {
        const message = this.props.l10n[this.props.locale][messageKey];
        const henkiloLocalized =
            this.props.l10n[this.props.locale]['HENKILO_KAYTTOOIKEUSANOMUS_NOTIFICATIONS_HENKILON'];
        const etunimet = henkilo.etunimet;
        const sukunimi = henkilo.sukunimi;
        const oid = henkilo.oid;
        return `${henkiloLocalized} ${etunimet} ${sukunimi} (${oid}) ${message}`;
    }
}

export default AnomusPage;
