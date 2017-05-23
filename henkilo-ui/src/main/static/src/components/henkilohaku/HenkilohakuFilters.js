import './HenkilohakuFilters.css'
import React from 'react'
import {Collapse} from 'react-collapse'
import OphCheckboxInline from "./criterias/OphCheckboxInline";
import SubOrganisationCheckbox from "./criterias/SubOrganisationCheckbox";
import NoOrganisationCheckbox from "./criterias/NoOrganisationCheckbox";
import PassiivisetOrganisationCheckbox from "./criterias/PassiivisetOrganisationCheckbox";
import DuplikaatitOrganisationCheckbox from "./criterias/DuplikaatitOrganisationCheckbox";
import OphInline from "./criterias/OphInline";
import OphSelect from "../common/select/OphSelect";

class HenkilohakuFilters extends React.Component {
    static propTypes = {
        L: React.PropTypes.object.isRequired,
        initialValues: React.PropTypes.shape({
            subOrganisation: React.PropTypes.bool.isRequired,
            noOrganisation: React.PropTypes.bool.isRequired,
            passivoitu: React.PropTypes.bool.isRequired,
            dublicates: React.PropTypes.bool.isRequired,
        }).isRequired,
        suborganisationAction: React.PropTypes.func.isRequired,
        noOrganisationAction: React.PropTypes.func.isRequired,
        passiivisetAction: React.PropTypes.func.isRequired,
        duplikaatitAction: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.L;

        this.state = {
            isOpen: true,
        };
    };

    render() {
        return <div>
            <a style={{cursor: "pointer"}} onClick={() => this.setState({isOpen: !this.state.isOpen,})} >
                {this.L['HENKILOHAKU_LISAVAIHTOEHDOT']}
            </a>
            <Collapse isOpened={this.state.isOpen}>
                <div className="henkilohakufilters-wrapper">
                    <OphCheckboxInline text={this.L['HENKILOHAKU_FILTERS_HAEMYOS']} >
                        <SubOrganisationCheckbox L={this.L}
                                                 subOrganisationValue={this.props.initialValues.subOrganisation}
                                                 subOrganisationAction={this.props.suborganisationAction}/>
                        <NoOrganisationCheckbox L={this.L}
                                                noOrganisationValue={this.props.initialValues.noOrganisation}
                                                noOrganisationAction={this.props.noOrganisationAction} />
                        <PassiivisetOrganisationCheckbox L={this.L}
                                                         passiivisetValue={this.props.initialValues.passivoitu}
                                                         passiivisetAction={this.props.passiivisetAction} />
                        <DuplikaatitOrganisationCheckbox L={this.L}
                                                         duplikaatitValue={this.props.initialValues.dublicates}
                                                         duplikaatitAction={this.props.duplikaatitAction} />
                    </OphCheckboxInline>
                    <OphInline>
                        <label className="oph-label demo-label-inline oph-bold" htmlFor="organisationFilter">{this.L['HENKILOHAKU_FILTERS_SUODATAORGANISAATIOLLA']}</label>
                        <div style={{width: "200px", marginRight: "32px"}}>
                            <OphSelect id="organisationFilter" />
                        </div>
                        <label className="oph-label demo-label-inline oph-bold" htmlFor="kayttooikeusryhmaFilter">{this.L['HENKILOHAKU_FILTERS_SUODATAKORYHMALLA']}</label>
                        <div style={{width: "200px"}}>
                            <OphSelect id="kayttooikeusryhmaFilter" />
                        </div>
                    </OphInline>
                </div>
            </Collapse>
        </div>;
    };
}



export default HenkilohakuFilters;
