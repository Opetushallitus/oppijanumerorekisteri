import './HenkilohakuFilters.css'
import React from 'react'
import PropTypes from 'prop-types'
import OphCheckboxInline from "../common/forms/OphCheckboxInline";
import SubOrganisationCheckbox from "./criterias/SubOrganisationCheckbox";
import NoOrganisationCheckbox from "./criterias/NoOrganisationCheckbox";
import PassiivisetOrganisationCheckbox from "./criterias/PassiivisetOrganisationCheckbox";
import DuplikaatitOrganisationCheckbox from "./criterias/DuplikaatitOrganisationCheckbox";
import OphInline from "../common/forms/OphInline";
import OphSelect from "../common/select/OphSelect";
import OrganisaatioSelection from "../common/select/OrganisaatioSelection";
import StaticUtils from "../common/StaticUtils";
import CloseButton from "../common/button/CloseButton";
import R from 'ramda';

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
        omattiedot: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
    };

    render() {
        return <div>
            <div className="henkilohakufilters-wrapper">
                <OphCheckboxInline text={this.L['HENKILOHAKU_FILTERS_HAEMYOS']}>
                    <SubOrganisationCheckbox L={this.L}
                                             subOrganisationValue={this.props.initialValues.subOrganisation}
                                             subOrganisationAction={this.props.suborganisationAction}/>
                    {
                        this.props.omattiedot.isAdmin ?
                            <OphInline>
                                <NoOrganisationCheckbox L={this.L}
                                                        noOrganisationValue={this.props.initialValues.noOrganisation}
                                                        noOrganisationAction={this.props.noOrganisationAction}/>
                                <PassiivisetOrganisationCheckbox L={this.L}
                                                                 passiivisetValue={this.props.initialValues.passivoitu}
                                                                 passiivisetAction={this.props.passiivisetAction}/>
                                <DuplikaatitOrganisationCheckbox L={this.L}
                                                                 duplikaatitValue={this.props.initialValues.dublicates}
                                                                 duplikaatitAction={this.props.duplikaatitAction}/>
                            </OphInline>
                            : null}
                </OphCheckboxInline>

                <OphInline>
                    <label className="oph-label oph-bold" htmlFor="organisationFilter">
                        {this.L['HENKILOHAKU_FILTERS_SUODATA']}:
                    </label>
                </OphInline>
                <div className="flex-horizontal flex-align-center">
                    <div className="flex-item-1">
                        <label className="oph-label filter-label" htmlFor="organisationFilter">
                            {this.L['HENKILOHAKU_FILTERS_ORGANISAATIOLLA']}
                        </label>
                        <div className="henkilohaku-select">
                            <span className="flex-item-1">
                                <OrganisaatioSelection id="organisationFilter"
                                                       L={this.L}
                                                       locale={this.props.locale}
                                                       organisaatios={this.props.organisaatioList}
                                                       selectOrganisaatio={this.props.organisaatioSelectAction}
                                                       selectedOrganisaatioOid={this.props.selectedOrganisation}/>
                            </span>
                            <span className="henkilohaku-clear-select"><CloseButton closeAction={() => this.props.organisaatioSelectAction({value: undefined})}/></span>
                        </div>

                    </div>
                    <div className="flex-item-1">
                        <label className="oph-label filter-label" htmlFor="kayttooikeusryhmaFilter">
                            {this.L['HENKILOHAKU_FILTERS_SUODATAKORYHMALLA']}
                        </label>
                        <div className="henkilohaku-select">
                            <span className="flex-item-1">
                                <OphSelect id="kayttooikeusryhmaFilter"
                                       options={this.props.kayttooikeusryhmas.map(kayttooikeusryhma => ({
                                           value: kayttooikeusryhma.id,
                                           label: StaticUtils.getLocalisedText(kayttooikeusryhma.description.texts, this.props.locale)
                                       }))}
                                       value={this.props.selectedKayttooikeus}
                                       placeholder={this.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                                       onChange={this.props.kayttooikeusSelectionAction}/>
                            </span>
                            <span className="henkilohaku-clear-select">
                                <CloseButton closeAction={() => this.props.kayttooikeusSelectionAction({value: undefined})}/>
                            </span>
                        </div>
                    </div>
                    {
                        this.props.omattiedot.isAdmin || this.props.omattiedot.isOphVirkailija ?
                            <div className="flex-item-1">
                                <label className="oph-label filter-label" htmlFor="ryhmaFilter">
                                    {this.L['HENKILOHAKU_FILTERS_SUODATARYHMALLA']}
                                </label>
                                <div className="henkilohaku-select">
                                    <span className="flex-item-1">
                                        <OphSelect id="ryhmaFilter"
                                                   options={this._parseRyhmaOptions(this.props.ryhmas)}
                                                   value={this.props.selectedRyhma}
                                                   placeholder={this.L['HENKILOHAKU_FILTERS_RYHMA_PLACEHOLDER']}
                                                   onChange={this.props.ryhmaSelectionAction}/>
                                    </span>
                                    <span className="henkilohaku-clear-select"><CloseButton
                                        closeAction={() => this.props.ryhmaSelectionAction({value: undefined})}/>
                                    </span>
                                </div>
                            </div>
                            : null}
                </div>
            </div>
        </div>;
    };

    _parseRyhmaOptions(ryhmatState) {
        const ryhmat = R.path(['ryhmas'], ryhmatState);
        return ryhmat ? ryhmat.map(ryhma => ({
            label: ryhma.nimi[this.props.locale],
            value: ryhma.oid
        })) : [];
    };
}

export default HenkilohakuFilters;
