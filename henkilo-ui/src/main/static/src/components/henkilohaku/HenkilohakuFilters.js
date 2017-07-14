import './HenkilohakuFilters.css'
import React from 'react'
import PropTypes from 'prop-types'
import OphCheckboxInline from "./criterias/OphCheckboxInline";
import SubOrganisationCheckbox from "./criterias/SubOrganisationCheckbox";
import NoOrganisationCheckbox from "./criterias/NoOrganisationCheckbox";
import PassiivisetOrganisationCheckbox from "./criterias/PassiivisetOrganisationCheckbox";
import DuplikaatitOrganisationCheckbox from "./criterias/DuplikaatitOrganisationCheckbox";
import OphInline from "./criterias/OphInline";
import OphSelect from "../common/select/OphSelect";
import OrganisaatioSelection from "../kutsuminen/OrganisaatioSelection";
import StaticUtils from "../common/StaticUtils";
import CloseButton from "../common/button/CloseButton";

class HenkilohakuFilters extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        initialValues: PropTypes.shape({
            subOrganisation: PropTypes.bool.isRequired,
            noOrganisation: PropTypes.bool.isRequired,
            passivoitu: PropTypes.bool.isRequired,
            dublicates: PropTypes.bool.isRequired,
        }).isRequired,
        selectedOrganisation: PropTypes.string,
        organisaatioList: PropTypes.array.isRequired,
        selectedKayttooikeus: PropTypes.number,

        kayttooikeusSelectionAction: PropTypes.func.isRequired,
        organisaatioSelectAction: PropTypes.func.isRequired,
        suborganisationAction: PropTypes.func.isRequired,
        noOrganisationAction: PropTypes.func.isRequired,
        passiivisetAction: PropTypes.func.isRequired,
        duplikaatitAction: PropTypes.func.isRequired,

        kayttooikeusryhmas: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            description: PropTypes.shape({
                texts: PropTypes.arrayOf(PropTypes.shape({
                    text: PropTypes.string,
                    lang: PropTypes.string.isRequired,
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
                    <CloseButton closeAction={() => this.props.organisaatioSelectAction({value: undefined})} />

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
                    <CloseButton closeAction={() => this.props.kayttooikeusSelectionAction({value: undefined})} />
                </OphInline>
            </div>
        </div>;
    };
}

export default HenkilohakuFilters;
