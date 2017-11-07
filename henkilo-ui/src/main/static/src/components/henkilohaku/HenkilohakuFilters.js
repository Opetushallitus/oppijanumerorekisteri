// @flow
import './HenkilohakuFilters.css';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import OphCheckboxInline from "../common/forms/OphCheckboxInline";
import SubOrganisationCheckbox from "./criterias/SubOrganisationCheckbox";
import NoOrganisationCheckbox from "./criterias/NoOrganisationCheckbox";
import PassiivisetOrganisationCheckbox from "./criterias/PassiivisetOrganisationCheckbox";
import DuplikaatitOrganisationCheckbox from "./criterias/DuplikaatitOrganisationCheckbox";
import OphInline from "../common/forms/OphInline";
import OphSelect from "../common/select/OphSelect";
import OrganisaatioSelection from "../common/select/OrganisaatioSelection";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import {fetchAllRyhmas} from "../../actions/organisaatio.actions";
import {fetchAllKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import StaticUtils from "../common/StaticUtils";
import CloseButton from "../common/button/CloseButton";
import R from 'ramda';
import type {L} from "../../types/l.type";
import type {Locale} from "../../types/locale.type";

type Props = {
    L: L,
    locale: Locale,
    ryhmaSelectionAction: ({value: ?number}) => void,
    selectedRyhma: number,
    selectedOrganisation: string,
    selectedKayttooikeus: number,
    duplikaatitAction: () => void,
    passiivisetAction: () => void,
    suborganisationAction: () => void,
    noOrganisationAction: () => void,
    organisaatioSelectAction: ({value: ?string}) => void,
    kayttooikeusSelectionAction: ({value: ?string}) => void,
    initialValues: {
        subOrganisation: boolean,
        noOrganisation: boolean,
        passivoitu: boolean,
        dublicates: boolean,
    },
    kayttooikeusryhmas: Array<{
        id: number,
        description: {
            texts: Array<{text: string, lang: string,}>,
        }
    }>,
    organisaatioList: Array<{}>,
    ryhmas: {ryhmas: Array<{}>},
    fetchOmattiedotOrganisaatios: () => void,
    fetchAllRyhmas: () => void,
    fetchAllKayttooikeusryhma: () => void,
}

class HenkilohakuFilters extends React.Component<Props> {
    static propTypes = {
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

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios();
        this.props.fetchAllRyhmas();
        this.props.fetchAllKayttooikeusryhma();
    }

    render() {
        return <div>
            <div className="henkilohakufilters-wrapper">
                <OphCheckboxInline text={this.props.L['HENKILOHAKU_FILTERS_HAEMYOS']}>
                    <SubOrganisationCheckbox L={this.props.L}
                                             subOrganisationValue={this.props.initialValues.subOrganisation}
                                             subOrganisationAction={this.props.suborganisationAction}/>
                    {
                        this.props.isAdmin ?
                            <OphInline>
                                <NoOrganisationCheckbox L={this.props.L}
                                                        noOrganisationValue={this.props.initialValues.noOrganisation}
                                                        noOrganisationAction={this.props.noOrganisationAction}/>
                                <PassiivisetOrganisationCheckbox L={this.props.L}
                                                                 passiivisetValue={this.props.initialValues.passivoitu}
                                                                 passiivisetAction={this.props.passiivisetAction}/>
                                <DuplikaatitOrganisationCheckbox L={this.props.L}
                                                                 duplikaatitValue={this.props.initialValues.dublicates}
                                                                 duplikaatitAction={this.props.duplikaatitAction}/>
                            </OphInline>
                            : null}
                </OphCheckboxInline>

                <div className="flex-horizontal flex-align-center henkilohaku-suodata">
                    <div className="flex-item-1">

                        <div className="henkilohaku-select">
                            <span className="flex-item-1">
                                <OrganisaatioSelection id="organisationFilter"
                                                       placeholder={this.props.L['HENKILOHAKU_FILTERS_SUODATAORGANISAATIO']}
                                                       L={this.props.L}
                                                       locale={this.props.locale}
                                                       organisaatios={this.props.organisaatioList}
                                                       selectOrganisaatio={this.props.organisaatioSelectAction}
                                                       selectedOrganisaatioOid={this.props.selectedOrganisation}/>
                            </span>
                            <span className="henkilohaku-clear-select"><CloseButton
                                closeAction={() => this.props.organisaatioSelectAction({value: undefined})}/></span>
                        </div>

                    </div>
                    <div className="flex-item-1">
                        <div className="henkilohaku-select">
                            <span className="flex-item-1">
                                <OphSelect id="kayttooikeusryhmaFilter"
                                           options={this.props.kayttooikeusryhmas.map(kayttooikeusryhma => ({
                                               value: kayttooikeusryhma.id,
                                               label: StaticUtils.getLocalisedText(kayttooikeusryhma.description.texts, this.props.locale)
                                           }))}
                                           value={this.props.selectedKayttooikeus}
                                           placeholder={this.props.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                                           onChange={this.props.kayttooikeusSelectionAction}/>
                            </span>
                            <span className="henkilohaku-clear-select">
                                <CloseButton
                                    closeAction={() => this.props.kayttooikeusSelectionAction({value: undefined})}/>
                            </span>
                        </div>
                    </div>

                </div>
                {
                    this.props.isAdmin || this.props.isOphVirkailija ?
                        <div className="flex-horizontal flex-align-center henkilohaku-suodata">
                            <div className="flex-item-1">
                                <div className="henkilohaku-select">
                                    <span className="flex-item-1">
                                        <OphSelect id="ryhmaFilter"
                                                   options={this._parseRyhmaOptions(this.props.ryhmas)}
                                                   value={this.props.selectedRyhma}
                                                   placeholder={this.props.L['HENKILOHAKU_FILTERS_RYHMA_PLACEHOLDER']}
                                                   onChange={this.props.ryhmaSelectionAction}/>
                                    </span>
                                    <span className="henkilohaku-clear-select"><CloseButton
                                        closeAction={() => this.props.ryhmaSelectionAction({value: undefined})}/>
                                    </span>
                                </div>
                            </div>
                            <div className="flex-item-1"/>
                        </div>
                : null}
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

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
    ryhmas: state.ryhmatState,
    organisaatioList: state.omattiedot.organisaatios,
    kayttooikeusryhmas: state.kayttooikeus.allKayttooikeusryhmas,
});

export default connect(mapStateToProps, {
    fetchOmattiedotOrganisaatios,
    fetchAllRyhmas,
    fetchAllKayttooikeusryhma
})(HenkilohakuFilters);
