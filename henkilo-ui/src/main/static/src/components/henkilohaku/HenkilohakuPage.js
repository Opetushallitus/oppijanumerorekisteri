import './HenkilohakuPage.css'
import React from 'react'
import HenkilohakuFilters from "./HenkilohakuFilters";
import Table from "../common/table/Table";
import WideBlueNotification from "../common/notifications/WideBlueNotification";
import DelayedSearchInput from "./DelayedSearchInput";
import WideRedNotification from "../common/notifications/WideRedNotification";
import StaticUtils from "../common/StaticUtils";
import Loader from "../common/icons/Loader";

class HenkilohakuPage extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        initialCriteria: React.PropTypes.shape({
            subOrganisation: React.PropTypes.bool.isRequired,
            noOrganisation: React.PropTypes.bool.isRequired,
            passivoitu: React.PropTypes.bool.isRequired,
            dublicates: React.PropTypes.bool.isRequired,
        }),
        henkilo: React.PropTypes.shape({
            henkiloOrganisaatios: React.PropTypes.array.isRequired,
        }),
        kayttooikeusryhmas: React.PropTypes.array.isRequired,
        henkilohakuAction: React.PropTypes.func.isRequired,
        updateFilters: React.PropTypes.func.isRequired,
        henkilohakuResult: React.PropTypes.array.isRequired,
        henkiloHakuFilters: React.PropTypes.object.isRequired,
        henkilohakuLoading: React.PropTypes.bool.isRequired,
        router: React.PropTypes.object.isRequired,
        notifications: React.PropTypes.arrayOf(React.PropTypes.shape({
            type: React.PropTypes.string.isRequired,
            id: React.PropTypes.string.isRequired,
            notL10nMessage: React.PropTypes.string.isRequired,
        }).isRequired).isRequired,
        removeNotification: React.PropTypes.func.isRequired,
        clearHenkilohaku: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.initialised = false;
        this.headingTemplate = [
            {
                key: 'HENKILOHAKU_OIDHENKILO_HIDDEN',
                hide: true,
            },
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

        this.state = {
            henkilohakuModel: {
                ...props.initialCriteria,
                organisaatioOid: undefined,
                kayttooikeusryhmaId: undefined,
                nameQuery: undefined,
            },
            showNoDataMessage: false,
            allFetched: true,
            page: 0,
            sorted: [],
        };

    };

    componentWillReceiveProps(nextProps) {
        const newState = {
            showNoDataMessage: !nextProps.henkilohakuResult.length && !nextProps.henkilohakuLoading,
            allFetched: !nextProps.henkilohakuLoading
            && (nextProps.henkilohakuResult.length < 100
            || nextProps.henkilohakuResult.length === this.props.henkilohakuResult.length),
            initialised: nextProps.henkilohakuResult.length,
        };
        if(newState.allFetched) {
            newState.page = 0;
        }
        if(nextProps.henkilohakuResult.length) {
            this.initialised = true;
        }
        this.setState(newState);
    };

    // To preserve filter settings over page changes.
    componentWillMount() {
        if(Object.keys(this.props.henkiloHakuFilters).length) {
            this.setState({henkilohakuModel: this.props.henkiloHakuFilters});
        }
    };

    // To preserve filter settings over page changes.
    componentWillUnmount() {
        this.props.updateFilters(this.state.henkilohakuModel);
    };

    render() {
        return <div className="borderless-wrapper">
            {this.props.notifications.filter(notification => notification.type === 'error').map(notification =>
                <WideRedNotification closeAction={() => this.props.removeNotification('error', 'henkilohakuNotifications', 'HENKILOHAKU_ERROR')}
                                     message={this.L[notification.notL10nMessage]} /> )
            }
            <p className="oph-h2 oph-bold">{this.L['HENKILOHAKU_OTSIKKO']}</p>
            <DelayedSearchInput setSearchQueryAction={this.updateToSearchModel('nameQuery').bind(this)}
                                defaultNameQuery={this.state.henkilohakuModel.nameQuery} />
            <HenkilohakuFilters noOrganisationAction={this.updateToSearchModel('noOrganisation', true).bind(this)}
                                suborganisationAction={this.updateToSearchModel('subOrganisation', true).bind(this)}
                                duplikaatitAction={this.updateToSearchModel('dublicates', true).bind(this)}
                                passiivisetAction={this.updateToSearchModel('passivoitu', true).bind(this)}
                                initialValues={this.state.henkilohakuModel}
                                l10n={this.props.l10n}
                                locale={this.props.locale}
                                organisaatioList={this.props.henkilo.henkiloOrganisaatios}
                                selectedOrganisation={this.state.henkilohakuModel.organisaatioOid}
                                organisaatioSelectAction={this.updateToSearchModel('organisaatioOid').bind(this)}
                                kayttooikeusryhmas={this.props.kayttooikeusryhmas}
                                selectedKayttooikeus={this.state.henkilohakuModel.kayttooikeusryhmaId}
                                kayttooikeusSelectionAction={this.updateToSearchModel('kayttooikeusryhmaId').bind(this)} />
            {
                this.initialised && !this.state.showNoDataMessage
                    ? <div className="henkilohakuTableWrapper">
                        <Table headings={this.headingTemplate.map(template =>
                            Object.assign({}, template, {label: this.L[template.key] || template.key}))}
                               data={this.createRows(this.headingTemplate.map(template => template.key))}
                               noDataText=""
                               striped
                               highlight
                               getTdProps={(state, rowInfo, column, instance) => {
                                   return {
                                       onClick: e => this.props.router.push('/virkailija/' +
                                           rowInfo.row['HENKILOHAKU_OIDHENKILO_HIDDEN']),
                                       style: {cursor: "pointer"}
                                   }
                               }}
                               manual
                               defaultSorted={this.state.sorted}
                               onFetchData={this.onTableFetch.bind(this)}
                               fetchMoreSettings={{
                                   isActive: !this.state.allFetched && !this.props.henkilohakuLoading,
                                   fetchMoreAction: () => this.searchQuery(true),
                               }}
                               isLoading={this.props.henkilohakuLoading } />
                    </div>
                    : this.props.henkilohakuLoading ? <Loader /> : null
            }
            {
                this.state.showNoDataMessage
                    ? <WideBlueNotification closeAction={() => this.setState({showNoDataMessage: false})}
                                            message={this.L['HENKILOHAKU_EI_TULOKSIA']} />
                    : null
            }
        </div>;
    };

    onTableFetch(tableState, instance) {
        const sort = tableState.sorted[0];
        const stateSort = this.state.sorted[0];
        // Update sort state
        if(sort) {
            this.setState({
                sorted: [Object.assign({}, sort)],
            });
            // If sort state changed fetch new data
            if(!stateSort || sort.id !== stateSort.id || sort.desc !== stateSort.desc) {
                this.searchQuery();
            }
        }
    };

    createRows(headingKeys) {
        return this.props.henkilohakuResult.map((henkilo, idx) => ({
            [headingKeys[0]]: henkilo.oidHenkilo || '',
            [headingKeys[1]]: <span className="oph-blue-lighten-1">{henkilo.nimi || ''}</span>,
            [headingKeys[2]]: henkilo.kayttajatunnus || '',
            [headingKeys[3]]: <ul>{henkilo.organisaatioNimiList.map((organisaatio, idx2) =>
                <li key={idx2}>{(organisaatio.localisedLabels[this.props.locale] || organisaatio.identifier)
                + ' ' + StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, this.L, true)}</li>)}</ul>,
        }));
    };

    updateToSearchModel(key, isEvent) {
        return (entity) => {
            this.setState({
                henkilohakuModel: {
                    ...this.state.henkilohakuModel,
                    [key]: !isEvent ? entity.value : entity.target.checked
                }
            }, this.searchQuery); // Do query when model updates.
        }
    };

    searchQuery(shouldNotClear) {
        if(!shouldNotClear) {
            this.props.clearHenkilohaku();
        }
        const queryParams = {};
        if(this.state.henkilohakuModel.nameQuery
            || this.state.henkilohakuModel.organisaatioOid
            || this.state.henkilohakuModel.kayttooikeusryhmaId) {
            this.setState({page: this.state.page+1},
                () => this.props.henkilohakuAction(this.state.henkilohakuModel,
                    Object.assign(queryParams, {
                        offset: shouldNotClear ? 100*this.state.page : 0,
                        orderBy: this.state.sorted.length
                            ? (this.state.sorted[0].desc ? this.state.sorted[0].id + '_DESC' : this.state.sorted[0].id + "_ASC")
                            : undefined,
                    })));
        }
    };

}

export default HenkilohakuPage;
