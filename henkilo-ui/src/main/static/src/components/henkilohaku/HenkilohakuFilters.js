// @flow
import './HenkilohakuFilters.css';
import React from 'react';
import {connect} from 'react-redux';
import OphCheckboxInline from "../common/forms/OphCheckboxInline";
import SubOrganisationCheckbox from "./criterias/SubOrganisationCheckbox";
import NoOrganisationCheckbox from "./criterias/NoOrganisationCheckbox";
import PassiivisetOrganisationCheckbox from "./criterias/PassiivisetOrganisationCheckbox";
import DuplikaatitOrganisationCheckbox from "./criterias/DuplikaatitOrganisationCheckbox";
import OphInline from "../common/forms/OphInline";
import OphSelect from "../common/select/OphSelect";
import {fetchOmatHenkiloHakuOrganisaatios} from "../../actions/omattiedot.actions";
import {fetchAllRyhmas} from "../../actions/organisaatio.actions";
import {fetchAllKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import StaticUtils from "../common/StaticUtils";
import CloseButton from "../common/button/CloseButton";
import * as R from 'ramda';
import type {Localisations} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {HenkilohakuCriteria} from "../../types/domain/kayttooikeus/HenkilohakuCriteria.types";
import {omattiedotOrganisaatiotToOrganisaatioSelectObject} from "../../utilities/organisaatio.util";
import {OrganisaatioSelectModal} from "../common/select/OrganisaatioSelectModal";
import type {OrganisaatioSelectObject} from "../../types/organisaatioselectobject.types";
import type {KayttooikeusOrganisaatiot} from "../../types/domain/kayttooikeus/KayttooikeusPerustiedot.types";
import type {Kayttooikeusryhma} from "../../types/domain/kayttooikeus/kayttooikeusryhma.types";

type Props = {
    L: Localisations,
    locale: Locale,
    ryhmaSelectionAction: ({value: ?number}) => void,
    selectedRyhma: ?string,
    selectedOrganisation?: Array<string> | string,
    selectedKayttooikeus: ?string,
    duplikaatitAction: () => void,
    passiivisetAction: () => void,
    suborganisationAction: () => void,
    noOrganisationAction: () => void,
    organisaatioSelectAction: (OrganisaatioSelectObject) => void,
    clearOrganisaatioSelection: () => void,
    kayttooikeusSelectionAction: ({value: ?string}) => void,
    initialValues: HenkilohakuCriteria,
    kayttooikeusryhmas: Array<Kayttooikeusryhma>,
    ryhmas: {ryhmas: Array<{}>},
    fetchAllRyhmas: () => any,
    fetchAllKayttooikeusryhma: () => void,
    henkilohakuOrganisaatiotLoading: boolean,
    henkilohakuOrganisaatiot: Array<KayttooikeusOrganisaatiot>,
    isAdmin: boolean,
    isOphVirkailija: boolean,
    fetchOmatHenkiloHakuOrganisaatios: () => any
}

type State = {
    organisaatioSelection: string
}

class HenkilohakuFilters extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            organisaatioSelection: ''
        }
    }

    componentDidMount() {
        this.props.fetchOmatHenkiloHakuOrganisaatios();
        this.props.fetchAllRyhmas();
        this.props.fetchAllKayttooikeusryhma();
    }

    render() {
        return <div>
            <div className="henkilohakufilters-wrapper">
                <OphCheckboxInline text={this.props.L['HENKILOHAKU_FILTERS_HAEMYOS']}>
                    {
                        this.props.isAdmin ?
                            <OphInline>
                                <SubOrganisationCheckbox L={this.props.L}
                                                         subOrganisationValue={this.props.initialValues.subOrganisation}
                                                         subOrganisationAction={this.props.suborganisationAction}/>
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
                            :
                            <OphInline>
                                <SubOrganisationCheckbox L={this.props.L}
                                                         subOrganisationValue={this.props.initialValues.subOrganisation}
                                                         subOrganisationAction={this.props.suborganisationAction}/>
                            </OphInline>}
                </OphCheckboxInline>

                <div className="flex-horizontal flex-align-center henkilohaku-suodata">
                    <div className="flex-item-1">

                        <div className="henkilohaku-select">
                            <input className="oph-input flex-item-1 henkilohaku-organisaatiosuodatus" type="text" value={this.state.organisaatioSelection} placeholder={this.props.L['HENKILOHAKU_ORGANISAATIOSUODATUS']} readOnly/>
                            <OrganisaatioSelectModal
                                L={this.props.L}
                                locale={this.props.locale}
                                disabled={this.props.henkilohakuOrganisaatiotLoading || (this.props.henkilohakuOrganisaatiot.length === 0)}
                                onSelect={this.organisaatioSelectAction.bind(this)}
                                organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(this.props.henkilohakuOrganisaatiot, this.props.locale)}
                            ></OrganisaatioSelectModal>
                            <span className="henkilohaku-clear-select"><CloseButton
                                closeAction={() => this.clearOrganisaatioSelection()}/></span>
                        </div>

                    </div>
                    <div className="flex-item-1">
                        <div className="henkilohaku-select">
                            <span className="flex-item-1">
                                <OphSelect id="kayttooikeusryhmaFilter"
                                           options={this.props.kayttooikeusryhmas.filter(kayttooikeusryhma => !kayttooikeusryhma.passivoitu)
                                               .map(kayttooikeusryhma => ({
                                                   value: kayttooikeusryhma.id,
                                                   label: StaticUtils.getLocalisedText(kayttooikeusryhma.description, this.props.locale)
                                               })).sort((a,b) => a.label.localeCompare(b.label))}
                                           value={this.props.selectedKayttooikeus}
                                           placeholder={this.props.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                                           onChange={this.props.kayttooikeusSelectionAction}
                                />
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

    clearOrganisaatioSelection = (): void => {
        this.setState({organisaatioSelection: ''});
        this.props.clearOrganisaatioSelection();
    };

    organisaatioSelectAction = (organisaatio: OrganisaatioSelectObject): void => {
        this.setState({organisaatioSelection: organisaatio.name});
        this.props.organisaatioSelectAction(organisaatio);
    };

    _parseRyhmaOptions(ryhmatState) {
        const ryhmat = R.path(['ryhmas'], ryhmatState);
        return ryhmat ? ryhmat.map(ryhma => ({
            label: ryhma.nimi[this.props.locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
            value: ryhma.oid
        })).sort((a,b) => a.label.localeCompare(b.label)) : [];
    };
}

const mapStateToProps = (state) => {
    return {
        L: state.l10n.localisations[state.locale],
        locale: state.locale,
        isAdmin: state.omattiedot.isAdmin,
        isOphVirkailija: state.omattiedot.isOphVirkailija,
        ryhmas: state.ryhmatState,
        organisaatioList: state.omattiedot.organisaatios,
        kayttooikeusryhmas: state.kayttooikeus.allKayttooikeusryhmas,
        henkilohakuOrganisaatiotLoading: state.omattiedot.henkilohakuOrganisaatiotLoading,
        henkilohakuOrganisaatiot: state.omattiedot.henkilohakuOrganisaatiot,
    };
};

export default connect(mapStateToProps, {
    fetchOmatHenkiloHakuOrganisaatios,
    fetchAllRyhmas,
    fetchAllKayttooikeusryhma
})(HenkilohakuFilters);
