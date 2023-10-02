import './HenkilohakuPage.css';
import React from 'react';
import HenkilohakuFilters from './HenkilohakuFilters';
import Table from '../common/table/Table';
import DelayedSearchInput from './DelayedSearchInput';
import StaticUtils from '../common/StaticUtils';
import Loader from '../common/icons/Loader';
import { Link } from 'react-router';
import { toLocalizedText } from '../../localizabletext';
import {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters,
} from '../../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { Localisations, L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { HenkilohakuResult } from '../../types/domain/kayttooikeus/HenkilohakuResult.types';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';

type Props = {
    l10n: L10n;
    locale: Locale;
    isAdmin: boolean;
    henkilohakuAction: (arg0: HenkilohakuCriteria, arg1: HenkilohakuQueryparameters) => void;
    henkilohakuCount: (arg0: HenkilohakuCriteria) => void;
    updateFilters: (arg0: HenkilohakuCriteria) => void;
    henkilohakuResult: Array<HenkilohakuResult>;
    henkilohakuResultCount: number;
    henkiloHakuFilters: HenkilohakuCriteria;
    henkilohakuLoading: boolean;
    clearHenkilohaku: () => void;
};

type State = {
    henkilohakuModel: HenkilohakuCriteria;
    showNoDataMessage: boolean;
    allFetched: boolean;
    page: number;
    sorted: Array<any>;
    ryhmaOid?: string;
    initialised: boolean;
};

const initialState: State = {
    henkilohakuModel: {
        noOrganisation: false,
        subOrganisation: true,
        passivoitu: false,
        dublicates: false,
        organisaatioOids: undefined,
        kayttooikeusryhmaId: undefined,
        ryhmaOids: undefined,
        nameQuery: undefined,
    },
    showNoDataMessage: false,
    allFetched: true,
    page: 0,
    sorted: [],
    ryhmaOid: undefined,
    initialised: false,
};

const columnHeaders = [
    {
        key: 'HENKILO_NIMI',
        maxWidth: 400,
    },
    {
        key: 'USERNAME',
        maxWidth: 200,
    },
    {
        key: 'HENKILOHAKU_ORGANISAATIO',
        notSortable: true,
    },
];

class HenkilohakuPage extends React.Component<Props, State> {
    initialised = false;
    L: Localisations = this.props.l10n[this.props.locale];

    state: State = initialState;

    componentWillReceiveProps(nextProps: Props): void {
        const newState = {
            showNoDataMessage: !nextProps.henkilohakuResult.length && !nextProps.henkilohakuLoading,
            allFetched:
                !nextProps.henkilohakuLoading &&
                (nextProps.henkilohakuResult.length < 100 ||
                    nextProps.henkilohakuResult.length === this.props.henkilohakuResult.length),
            initialised: !!nextProps.henkilohakuResult.length,
            page: this.state.page,
        };
        if (newState.allFetched) {
            newState.page = 0;
        }
        if (nextProps.henkilohakuResult.length) {
            this.initialised = true;
        }
        this.setState(newState);
    }

    // To preserve filter settings over page changes.
    componentWillMount() {
        if (Object.keys(this.props.henkiloHakuFilters).length) {
            this.setState({ henkilohakuModel: this.props.henkiloHakuFilters });
        }
    }

    // To preserve filter settings over page changes.
    componentWillUnmount() {
        this.props.updateFilters(this.state.henkilohakuModel);
    }

    render() {
        return (
            <div className="wrapper">
                <div className="oph-h2 oph-bold henkilohaku-main-header">{this.L['HENKILOHAKU_OTSIKKO']}</div>
                <DelayedSearchInput
                    setSearchQueryAction={this.updateNameQuery.bind(this)}
                    defaultNameQuery={this.state.henkilohakuModel.nameQuery}
                    loading={this.props.henkilohakuLoading}
                    minSearchValueLength={2}
                />
                <HenkilohakuFilters
                    noOrganisationAction={this.updateToSearchModel('noOrganisation', true).bind(this)}
                    suborganisationAction={this.updateToSearchModel('subOrganisation', true).bind(this)}
                    duplikaatitAction={this.updateToSearchModel('dublicates', true).bind(this)}
                    passiivisetAction={this.updateToSearchModel('passivoitu', true).bind(this)}
                    initialValues={this.state.henkilohakuModel}
                    selectedOrganisation={this.state.henkilohakuModel.organisaatioOids}
                    organisaatioSelectAction={this.selectOrganisaaOid.bind(this)}
                    clearOrganisaatioSelection={this.clearOrganisaatio.bind(this)}
                    selectedRyhma={this.state.ryhmaOid}
                    ryhmaSelectionAction={this.selectRyhmaOid.bind(this)}
                    selectedKayttooikeus={this.state.henkilohakuModel.kayttooikeusryhmaId}
                    kayttooikeusSelectionAction={this.updateToSearchModel('kayttooikeusryhmaId').bind(this)}
                />
                <div className="oph-h3 oph-bold henkilohaku-result-header">
                    {this.L['HENKILOHAKU_HAKUTULOKSET']} (
                    {this.state.showNoDataMessage || this.props.henkilohakuResultCount === 0
                        ? this.L['HENKILOHAKU_EI_TULOKSIA']
                        : `${this.props.henkilohakuResultCount} ${this.L['HENKILOHAKU_OSUMA']}`}
                    )
                </div>
                {(this.initialised && !this.state.showNoDataMessage) || this.props.henkilohakuResult.length ? (
                    <div className="henkilohakuTableWrapper">
                        <Table
                            headings={columnHeaders.map((template) =>
                                Object.assign({}, template, {
                                    label: this.L[template.key] || template.key,
                                })
                            )}
                            data={this.createRows(columnHeaders.map((template) => template.key))}
                            noDataText=""
                            striped
                            highlight
                            manual
                            defaultSorted={this.state.sorted}
                            onFetchData={this.onTableFetch.bind(this)}
                            fetchMoreSettings={{
                                isActive: !this.state.allFetched && !this.props.henkilohakuLoading,
                                fetchMoreAction: () => this.searchQuery(true),
                            }}
                            isLoading={this.props.henkilohakuLoading}
                        />
                    </div>
                ) : this.props.henkilohakuLoading ? (
                    <Loader />
                ) : null}
            </div>
        );
    }

    onTableFetch(tableState: any) {
        const sort = tableState.sorted[0];
        const stateSort = this.state.sorted[0];
        // Update sort state
        if (sort) {
            this.setState({
                sorted: [{ ...sort }],
            });
            // If sort state changed fetch new data
            if (!stateSort || sort.id !== stateSort.id || sort.desc !== stateSort.desc) {
                this.searchQuery(false);
            }
        }
    }

    createRows(headingKeys: Array<string>) {
        return this.props.henkilohakuResult.map((henkilo) => ({
            [headingKeys[0]]: <Link to={`/virkailija/${henkilo.oidHenkilo}`}>{henkilo.nimi || ''}</Link>,
            [headingKeys[1]]: henkilo.kayttajatunnus || '',
            [headingKeys[2]]: (
                <ul>
                    {henkilo.organisaatioNimiList.map((organisaatio, idx2) => (
                        <li key={idx2}>
                            {(toLocalizedText(this.props.locale, organisaatio.localisedLabels) ||
                                organisaatio.identifier) +
                                ' ' +
                                StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, this.L, true)}
                        </li>
                    ))}
                </ul>
            ),
        }));
    }

    clearOrganisaatio = () => {
        const henkilohakuModel = { ...this.state.henkilohakuModel };
        henkilohakuModel.organisaatioOids = undefined;
        this.setState({ henkilohakuModel }, this.searchQuery);
    };

    selectOrganisaaOid(organisaatio: OrganisaatioSelectObject) {
        const henkilohakuModel = { ...this.state.henkilohakuModel, organisaatioOids: [organisaatio.oid] };
        this.setState({ ryhmaOid: undefined, henkilohakuModel }, this.searchQuery);
    }

    selectRyhmaOid(ryhmaOption: { value?: string }) {
        const henkilohakuModel = {
            ...this.state.henkilohakuModel,
            organisaatioOids: ryhmaOption?.value ? [ryhmaOption.value] : undefined,
        };
        this.setState({ ryhmaOid: ryhmaOption.value, henkilohakuModel }, this.searchQuery);
    }

    updateNameQuery(nameQuery: string) {
        this.setState(
            {
                henkilohakuModel: {
                    ...this.state.henkilohakuModel,
                    nameQuery,
                },
            },
            this.searchQuery
        );
    }

    updateToSearchModel(key: string, isEvent?: boolean) {
        return (entity: any) => {
            this.setState(
                {
                    henkilohakuModel: {
                        ...this.state.henkilohakuModel,
                        [key]: !isEvent ? entity.value : entity.target.checked,
                    },
                },
                this.searchQuery
            ); // Do query when model updates.
        };
    }

    searchQuery(shouldNotClear?: boolean): void {
        if (!shouldNotClear) {
            this.props.clearHenkilohaku();
        }
        const henkilohakuModel = { ...this.state.henkilohakuModel };
        if (henkilohakuModel.nameQuery || henkilohakuModel.organisaatioOids || henkilohakuModel.kayttooikeusryhmaId) {
            this.setState({ page: this.state.page + 1 }, () => {
                const queryParams = {
                    offset: shouldNotClear ? 100 * this.state.page : 0,
                    orderBy: this.state.sorted.length
                        ? this.state.sorted[0].desc
                            ? this.state.sorted[0].id + '_DESC'
                            : this.state.sorted[0].id + '_ASC'
                        : undefined,
                };

                const henkilohakuCriteria: HenkilohakuCriteria = {
                    ...this.state.henkilohakuModel,
                    isCountSearch: false,
                };

                const henkilohakuCountCriteria: HenkilohakuCriteria = {
                    ...this.state.henkilohakuModel,
                    isCountSearch: true,
                };

                this.props.henkilohakuAction(henkilohakuCriteria, queryParams);
                this.props.henkilohakuCount(henkilohakuCountCriteria);
            });
        }
    }
}

export default HenkilohakuPage;
