import './HenkilohakuFilters.css'
import React from 'react'
import OphCheckboxInline from "./criterias/OphCheckboxInline";
import SubOrganisationCheckbox from "./criterias/SubOrganisationCheckbox";
import NoOrganisationCheckbox from "./criterias/NoOrganisationCheckbox";
import PassiivisetOrganisationCheckbox from "./criterias/PassiivisetOrganisationCheckbox";
import DuplikaatitOrganisationCheckbox from "./criterias/DuplikaatitOrganisationCheckbox";
import OphInline from "./criterias/OphInline";
import OphSelect from "../common/select/OphSelect";
import OrganisaatioSelection from "../kutsuminen/OrganisaatioSelection";
import StaticUtils from "../common/StaticUtils";

class HenkilohakuFilters extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        initialValues: React.PropTypes.shape({
            subOrganisation: React.PropTypes.bool.isRequired,
            noOrganisation: React.PropTypes.bool.isRequired,
            passivoitu: React.PropTypes.bool.isRequired,
            dublicates: React.PropTypes.bool.isRequired,
        }).isRequired,
        selectedOrganisation: React.PropTypes.string,
        organisaatioList: React.PropTypes.array.isRequired,
        selectedKayttooikeus: React.PropTypes.number,

        kayttooikeusSelectionAction: React.PropTypes.func.isRequired,
        organisaatioSelectAction: React.PropTypes.func.isRequired,
        suborganisationAction: React.PropTypes.func.isRequired,
        noOrganisationAction: React.PropTypes.func.isRequired,
        passiivisetAction: React.PropTypes.func.isRequired,
        duplikaatitAction: React.PropTypes.func.isRequired,

        kayttooikeusryhmas: React.PropTypes.arrayOf(React.PropTypes.shape({
            id: React.PropTypes.number.isRequired,
            description: React.PropTypes.shape({
                texts: React.PropTypes.arrayOf(React.PropTypes.shape({
                    text: React.PropTypes.string,
                    lang: React.PropTypes.string.isRequired,
                }).isRequired),
            }).isRequired,
        }).isRequired).isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
    };

    render() {
        return <div>
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
                    <label className="oph-label demo-label-inline oph-bold" htmlFor="organisationFilter">
                        {this.L['HENKILOHAKU_FILTERS_SUODATAORGANISAATIOLLA']}
                    </label>
                    <div className="henkilohaku-select">
                        <OrganisaatioSelection id="organisationFilter"
                                               L={this.L}
                                               locale={this.props.locale}
                                               organisaatios={this.props.organisaatioList}
                                               selectOrganisaatio={this.props.organisaatioSelectAction}
                                               selectedOrganisaatioOid={this.props.selectedOrganisation} />
                    </div>
                    <label className="oph-label demo-label-inline oph-bold" htmlFor="kayttooikeusryhmaFilter">
                        {this.L['HENKILOHAKU_FILTERS_SUODATAKORYHMALLA']}
                    </label>
                    <div className="henkilohaku-select">
                        <OphSelect id="kayttooikeusryhmaFilter"
                                   options={this.props.kayttooikeusryhmas.map(kayttooikeusryhma => ({value: kayttooikeusryhma.id,
                                       label: StaticUtils.getLocalisedText(kayttooikeusryhma.description.texts, this.props.locale)}))}
                                   value={this.props.selectedKayttooikeus}
                                   placeholder={this.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                                   onChange={this.props.kayttooikeusSelectionAction} />
                    </div>
                </OphInline>
            </div>
        </div>;
    };
}

export default HenkilohakuFilters;
