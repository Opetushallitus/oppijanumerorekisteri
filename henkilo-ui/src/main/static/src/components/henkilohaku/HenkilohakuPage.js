import './HenkilohakuPage.css'
import React from 'react'
import HenkilohakuFilters from "./HenkilohakuFilters";
import Table from "../common/table/Table";
import WideBlueNotification from "../common/notifications/WideBlueNotification";

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
            },
            henkilohakuResult: [],
            showNoDataMessage: true,
        };

    };

    render() {
        return <div className="borderless-wrapper">
                <p className="oph-h2 oph-bold">{this.L['HENKILOHAKU_OTSIKKO']}</p>
                <input className="oph-input" />
                <HenkilohakuFilters noOrganisationAction={this.setCheckedFilterCriteria('noOrganisation').bind(this)}
                                    suborganisationAction={this.setCheckedFilterCriteria('subOrganisation').bind(this)}
                                    duplikaatitAction={this.setCheckedFilterCriteria('dublicates').bind(this)}
                                    passiivisetAction={this.setCheckedFilterCriteria('passivoitu').bind(this)}
                                    initialValues={this.state.henkilohakuModel}
                                    l10n={this.props.l10n}
                                    locale={this.props.locale}
                                    organisaatioList={this.props.henkilo.henkiloOrganisaatios}
                                    selectedOrganisation={this.state.henkilohakuModel.organisaatioOid}
                                    organisaatioSelectAction={this.updateToState('organisaatioOid').bind(this)}
                                    kayttooikeusryhmas={this.props.kayttooikeusryhmas}
                                    selectedKayttooikeus={this.state.henkilohakuModel.kayttooikeusryhmaId}
                                    kayttooikeusSelectionAction={this.updateToState('kayttooikeusryhmaId').bind(this)} />
                {
                    this.state.henkilohakuResult.length
                        ?
                        <Table headings={this.headingTemplate.map(template =>
                            Object.assign({}, template, {label: this.L[template.key] || template.key}))}
                               data={this.createRows(this.headingTemplate.map(template => template.key))}
                               noDataText=""
                               striped />
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
        return this.state.henkilohakuResult.map((henkilo, idx) => ({
            [headingKeys[0]]: henkilo.sukunimi + ', ' + henkilo.etunimet,
            [headingKeys[1]]: henkilo.kayttajatieto.username,
            [headingKeys[2]]: <ul>{henkilo.henkiloOrgs.map(organisaatio => <li>{organisaatio.organisaatioOid}</li>)}</ul>,
        }));
    };

    updateToState(key) {
        return (org) => this.setState({
            henkilohakuModel: {
                ...this.state.henkilohakuModel,
                [key]: org.value
            }
        });
    }

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
