import './HenkilohakuPage.css'
import React from 'react'
import HenkilohakuFilters from "./HenkilohakuFilters";
import Table from "../common/table/Table";
import WideBlueNotification from "../common/notifications/WideBlueNotification";

class HenkilohakuPage extends React.Component {
    static propTypes = {
        L: React.PropTypes.object.isRequired,
        initialCriteria: React.PropTypes.shape({
            subOrganisation: React.PropTypes.bool.isRequired,
            noOrganisation: React.PropTypes.bool.isRequired,
            passivoitu: React.PropTypes.bool.isRequired,
            dublicates: React.PropTypes.bool.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.L = this.props.L;

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
                ...props.initialCriteria
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
                                L={this.L} />
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
