import './HenkilohakuPage.css'
import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router'
import HenkilohakuFilters from "./HenkilohakuFilters";
import Table from "../common/table/Table";
import WideBlueNotification from "../common/notifications/WideBlueNotification";
import DelayedSearchInput from "./DelayedSearchInput";
import WideRedNotification from "../common/notifications/WideRedNotification";
import StaticUtils from "../common/StaticUtils";
import Loader from "../common/icons/Loader";
import R from 'ramda';

class HenkilohakuPage extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        initialCriteria: PropTypes.shape({
            subOrganisation: PropTypes.bool.isRequired,
            noOrganisation: PropTypes.bool.isRequired,
            passivoitu: PropTypes.bool.isRequired,
            dublicates: PropTypes.bool.isRequired,
        }),
        isAdmin: PropTypes.bool.isRequired,
        henkilohakuAction: PropTypes.func.isRequired,
        updateFilters: PropTypes.func.isRequired,
        henkilohakuResult: PropTypes.array.isRequired,
        henkiloHakuFilters: PropTypes.object.isRequired,
        henkilohakuLoading: PropTypes.bool.isRequired,
        router: PropTypes.object.isRequired,
        notifications: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
            notL10nMessage: PropTypes.string.isRequired,
        }).isRequired).isRequired,
        removeNotification: PropTypes.func.isRequired,
        clearHenkilohaku: PropTypes.func.isRequired,
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
                organisaatioOids: undefined,
                kayttooikeusryhmaId: undefined,
                ryhmaOids: undefined,
                nameQuery: undefined,
            },
            showNoDataMessage: false,
            allFetched: true,
            page: 0,
            sorted: [],
            ryhmaOid: undefined
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
            {this.props.isAdmin &&
                <Link to="palvelu/luonti">{this.L['PALVELUKAYTTAJAN_LUONTI_LINKKI']}</Link>
            }
            {this.props.isAdmin &&
                <Link to="oppija/luonti">{this.L['OPPIJAN_LUONTI_LINKKI']}</Link>
            }
            {this.props.notifications.filter(notification => notification.type === 'error').map( (notification, index) =>
                <WideRedNotification key={index} closeAction={() => this.props.removeNotification('error', 'henkilohakuNotifications', 'HENKILOHAKU_ERROR')}
                                     message={this.L[notification.notL10nMessage]} />)
            }
            <p className="oph-h2 oph-bold">{this.L['HENKILOHAKU_OTSIKKO']}</p>
            <DelayedSearchInput setSearchQueryAction={this.updateToSearchModel('nameQuery').bind(this)}
                                defaultNameQuery={this.state.henkilohakuModel.nameQuery}
                                loading={this.props.henkilohakuLoading} />
            <HenkilohakuFilters noOrganisationAction={this.updateToSearchModel('noOrganisation', true).bind(this)}
                                suborganisationAction={this.updateToSearchModel('subOrganisation', true).bind(this)}
                                duplikaatitAction={this.updateToSearchModel('dublicates', true).bind(this)}
                                passiivisetAction={this.updateToSearchModel('passivoitu', true).bind(this)}
                                initialValues={this.state.henkilohakuModel}
                                selectedOrganisation={this.state.henkilohakuModel.organisaatioOids}
                                organisaatioSelectAction={this.selectOrganisaaOid.bind(this)}
                                selectedRyhma={this.state.ryhmaOid}
                                ryhmaSelectionAction={this.selectRyhmaOid.bind(this)}
                                selectedKayttooikeus={this.state.henkilohakuModel.kayttooikeusryhmaId}
                                kayttooikeusSelectionAction={this.updateToSearchModel('kayttooikeusryhmaId').bind(this)}
            />
            {
                (this.initialised && !this.state.showNoDataMessage) || this.props.henkilohakuResult.length
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

    selectOrganisaaOid(organisaatioOption) {
        const henkilohakuModel = this.state.henkilohakuModel;
        henkilohakuModel.organisaatioOids = organisaatioOption.value;
        this.setState({ ryhmaOid: undefined, henkilohakuModel }, this.searchQuery);
    }

    selectRyhmaOid(ryhmaOption) {
        const henkilohakuModel = this.state.henkilohakuModel;
        henkilohakuModel.organisaatioOids = ryhmaOption.value;
        this.setState({ ryhmaOid: ryhmaOption.value, henkilohakuModel }, this.searchQuery);
    }

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
            || this.state.henkilohakuModel.organisaatioOids
            || this.state.henkilohakuModel.kayttooikeusryhmaId) {
            this.setState({page: this.state.page+1},
                () => {

                // turn organisaatioOids to array
                const henkiloHakuModel = R.clone(this.state.henkilohakuModel);
                henkiloHakuModel.organisaatioOids = henkiloHakuModel.organisaatioOids ? [henkiloHakuModel.organisaatioOids] : undefined;

                return this.props.henkilohakuAction(henkiloHakuModel,
                    Object.assign(queryParams, {
                        offset: shouldNotClear ? 100*this.state.page : 0,
                        orderBy: this.state.sorted.length
                            ? (this.state.sorted[0].desc ? this.state.sorted[0].id + '_DESC' : this.state.sorted[0].id + "_ASC")
                            : undefined,
                    }))
        });
        }
    };



}

export default HenkilohakuPage;
