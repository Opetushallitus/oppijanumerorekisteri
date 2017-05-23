import './HenkilohakuPage.css'
import React from 'react'
import HenkilohakuFilters from "./HenkilohakuFilters";
import Table from "../common/table/Table";

class HenkilohakuPage extends React.Component {
    static propTypes = {
        L: React.PropTypes.object.isRequired,
        usertypeprops: React.PropTypes.shape({
            withoutOrganisation: React.PropTypes.bool.isRequired,
            subOrganisations: React.PropTypes.bool.isRequired,
            passivoitu: React.PropTypes.bool.isRequired,
            dublicates: React.PropTypes.bool.isRequired,
        }).isRequired,
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
                ...props.usertypeprops
            },
            henkilohakuResult: [],
        };

    };

    render() {
        return <div className="borderless-wrapper">
            <p className="oph-h2 oph-bold">{this.L['HENKILOHAKU_OTSIKKO']}</p>
            <input className="oph-input" />
            <HenkilohakuFilters L={this.L}/>
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
        </div>;
    };

    createRows(headingKeys) {
        return this.state.henkilohakuResult.map((henkilo, idx) => ({
            [headingKeys[0]]: henkilo.sukunimi + ', ' + henkilo.etunimet,
            [headingKeys[1]]: henkilo.kayttajatieto.username,
            [headingKeys[2]]: <ul>{henkilo.henkiloOrgs.map(organisaatio => <li>{organisaatio.organisaatioOid}</li>)}</ul>,
        }));
    };
}

export default HenkilohakuPage;
