import './HenkilohakuPage.css'
import React from 'react'
import HenkilohakuFilters from "./HenkilohakuFilters";
import Table from "../common/table/Table";
import WideBlueNotification from "../common/notifications/WideBlueNotification";
import HenkilohakuButton from "./HenkilohakuButton";

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
        henkilohakuResult: React.PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.headingTemplate = [
            {
                key: 'HENKILOHAKU_NIMI',
            },
            {
                key: 'HENKILOHAKU_KAYTTAJATUNNUS',
            },
            {
                key: 'HENKILOHAKU_ORGANISAATIO',
            },
        ];

        this.state = {
            henkilohakuModel: {
                ...props.initialCriteria,
                organisaatioOid: undefined,
                kayttooikeusryhmaId: undefined,
                nameQuery: undefined,
            },
            showNoDataMessage: true,
        };

    };

    render() {
        return <div className="borderless-wrapper">
                <p className="oph-h2 oph-bold">{this.L['HENKILOHAKU_OTSIKKO']}</p>
                <HenkilohakuButton searchAction={this.searchQuery.bind(this)}
                                   setSearchQueryAction={this.updateToSearchModel('nameQuery').bind(this)} />
                <HenkilohakuFilters noOrganisationAction={this.setCheckedFilterCriteria('noOrganisation').bind(this)}
                                    suborganisationAction={this.setCheckedFilterCriteria('subOrganisation').bind(this)}
                                    duplikaatitAction={this.setCheckedFilterCriteria('dublicates').bind(this)}
                                    passiivisetAction={this.setCheckedFilterCriteria('passivoitu').bind(this)}
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
                    this.props.henkilohakuResult.length
                        ?
                        <div className="henkilohakuTableWrapper">
                            <Table headings={this.headingTemplate.map(template =>
                                Object.assign({}, template, {label: this.L[template.key] || template.key}))}
                                   data={this.createRows(this.headingTemplate.map(template => template.key))}
                                   noDataText=""
                                   striped />
                        </div>
                        : null
                }
                {
                    this.state.showNoDataMessage
                        ? <WideBlueNotification closeAction={() => this.setState({showNoDataMessage: false})}
                                                message={this.L['HENKILOHAKU_EI_TULOKSIA']} />
                        : null
                }
            </div>;
    };

    createRows(headingKeys) {
        return this.props.henkilohakuResult.map((henkilo, idx) => ({
            [headingKeys[0]]: henkilo.nimi,
            [headingKeys[1]]: henkilo.kayttajatunnus,
            [headingKeys[2]]: <ul>{henkilo.organisaatioNimiList.map(organisaatio => <li>{organisaatio}</li>)}</ul>,
        }));
    };

    updateToSearchModel(key) {
        return (org) => this.setState({
            henkilohakuModel: {
                ...this.state.henkilohakuModel,
                [key]: org.value
            }
        });
    };

    searchQuery() {
        if(this.state.henkilohakuModel.nameQuery) {
            this.props.henkilohakuAction(this.state.henkilohakuModel);
        }
    };

    setCheckedFilterCriteria(criteriaKey) {
        return (event) => this.setState({
            henkilohakuModel: {
                ...this.state.henkilohakuModel,
                [criteriaKey]: event.target.checked,
            },
        });
    };
}

export default HenkilohakuPage;
