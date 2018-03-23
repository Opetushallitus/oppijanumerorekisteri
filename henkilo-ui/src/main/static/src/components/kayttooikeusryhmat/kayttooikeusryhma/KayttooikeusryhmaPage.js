// @flow
import React from 'react';
import './KayttooikeusryhmaPage.css';
import KayttooikeusryhmanOrganisaatiorajoite from './KayttooikeusryhmanOrganisaatiorajoite';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';
import MyonnettavatKayttooikeusryhmat from './MyonnettavatKayttooikeusryhmat';
import KayttooikeusryhmatPalvelutJaKayttooikeudet from './KayttooikeusryhmatPalvelutJaKayttooikeudet';
import type {Locale} from '../../../types/locale.type';
import type {ReactSelectOption} from '../../../types/react-select.types';
import type {PalvelutState} from "../../../reducers/palvelut.reducer";
import type {KayttooikeusState} from "../../../reducers/kayttooikeus.reducer";
import type {TextGroup} from "../../../types/domain/kayttooikeus/textgroup.types";
import type {PalveluRooliModify} from "../../../types/domain/kayttooikeus/PalveluRooliModify.types";
import {http} from '../../../http';
import {urls} from 'oph-urls-js';
import type {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import * as R from 'ramda';
import type {Text} from "../../../types/domain/kayttooikeus/text.types";
import type {PalveluRooli} from "../../../types/domain/kayttooikeus/PalveluRooli.types";
import {
    omattiedotOrganisaatiotToOrganisaatioSelectObject
} from '../../../utilities/organisaatio.util';
import OphModal from "../../common/modal/OphModal";
import {SpinnerInButton} from "../../common/icons/SpinnerInButton";
import type {L} from "../../../types/localisation.type";
import type {OrganisaatioHenkilo} from "../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import {LocalNotification} from "../../common/Notification/LocalNotification";
import type {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types";
import {getLocalization} from "../../../utilities/localisation.util";

export type KayttooikeusryhmaNimi = {
    fi: string,
    sv: string,
    en: string
}

export type KayttooikeusryhmaKuvaus = {
    fi: string,
    sv: string,
    en: string
}

export type PalveluJaKayttooikeusSelection = {
    palvelu: ReactSelectOption,
    kayttooikeus: ReactSelectOption
}

export type KayttooikeusryhmaForm = {
    name: KayttooikeusryhmaNimi,
    description: KayttooikeusryhmaKuvaus,
    ryhmaRestriction: boolean,
    organisaatioSelections: Array<OrganisaatioSelectObject>,
    oppilaitostyypitSelections: Array<ReactSelectOption>,
    kayttooikeusryhmaSelections: Array<ReactSelectOption>,
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>,
}

type Props = {
    L: L,
    router: any,
    organisaatios: Array<OrganisaatioHenkilo>,
    koodisto: any,
    kayttooikeus: any,
    kayttooikeusState: KayttooikeusState,
    palvelutState: PalvelutState,
    locale: Locale,
    fetchPalveluKayttooikeus: (palveluName: string) => void,
    omattiedotOrganisaatiosLoading: boolean,
    kayttooikeusryhmaId?: string,
    organisaatioCache: any
}

type State = {
    kayttooikeusryhmaForm: KayttooikeusryhmaForm,
    palvelutSelection: ReactSelectOption | void,
    palveluKayttooikeusSelection: ReactSelectOption | void,
    showPassivoiModal: boolean,
    ryhmaRestrictionViite: any,
    toggleTallenna: boolean,
    togglePassivoi: boolean,
    toggleErrorOnSave: boolean,
    organisaatios: Array<OrganisaatioSelectObject>
};

export default class KayttooikeusryhmaPage extends React.Component<Props, State> {

    state = {
        kayttooikeusryhmaForm: {
            name: {fi: '', sv: '', en: ''},
            description: {fi: '', sv: '', en: ''},
            organisaatioSelections: [],
            oppilaitostyypitSelections: [],
            ryhmaRestriction: false,
            kayttooikeusryhmaSelections: [],
            palveluJaKayttooikeusSelections: [],
        },
        palvelutSelection: undefined,
        palveluKayttooikeusSelection: undefined,
        showPassivoiModal: false,
        ryhmaRestrictionViite: undefined,
        toggleTallenna: false,
        togglePassivoi: false,
        toggleErrorOnSave: false,
        organisaatios: []
    };

    componentDidMount() {
        if (this.props.kayttooikeusryhmaId) {
            const kayttooikeusryhmaForm: KayttooikeusryhmaForm = this._parseExistingKayttooikeusryhmaData(this.props.kayttooikeus);
            const ryhmaRestrictionViite = this._parseExistingRyhmaRestrictionViite(R.path(['kayttooikeusryhma', 'organisaatioViite'], this.props.kayttooikeus));
            const organisaatios = omattiedotOrganisaatiotToOrganisaatioSelectObject(this.props.organisaatios, this.props.locale);
            const newState = { kayttooikeusryhmaForm, ryhmaRestrictionViite, organisaatios };
            this.setState(newState);
        }

    }

    _parseExistingRyhmaRestrictionViite = (organisaatioViitteet: any): any => {
        return R.find( (viite) => this._isRyhmaOid(viite.organisaatioTyyppi))(organisaatioViitteet);
    };

    render() {
        return <div className="wrapper">

            <KayttooikeusryhmatNimi {...this.props}
                                    name={this.state.kayttooikeusryhmaForm.name}
                                    setName={this._setName}
            />

            <KayttooikeusryhmatKuvaus {...this.props}
                                      description={this.state.kayttooikeusryhmaForm.description}
                                      setDescription={this._setDescription}
            />

            <KayttooikeusryhmanOrganisaatiorajoite {...this.props}
                                                   ryhmaRestriction={this.state.kayttooikeusryhmaForm.ryhmaRestriction}
                                                   toggleRyhmaRestriction={this._toggleRyhmaRestriction}
                                                   organisaatioSelectAction={this._onOrganisaatioSelection}
                                                   organisaatioSelections={this.state.kayttooikeusryhmaForm.organisaatioSelections}
                                                   removeOrganisaatioSelectAction={this._onRemoveOrganisaatioSelect}
                                                   oppilaitostyypitSelectAction={this._onOppilaitostyypitSelection}
                                                   oppilaitostyypitSelections={this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections}
                                                   removeOppilaitostyypitSelectionAction={this._onRemoveOppilaitostyypitSelect}
            />

            <MyonnettavatKayttooikeusryhmat {...this.props}
                                            kayttooikeusryhmaSelectAction={this._onKayttooikeusryhmaSelection}
                                            kayttooikeusryhmaSelections={this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections}
                                            removeKayttooikeusryhmaSelectAction={this._onRemoveKayttooikeusryhmaSelect}
            />

            <KayttooikeusryhmatPalvelutJaKayttooikeudet {...this.props}
                                                        palvelutSelection={this.state.palvelutSelection}
                                                        palvelutSelectAction={this._onPalvelutSelection}

                                                        palveluKayttooikeusSelectAction={this._onPalveluKayttooikeusSelection}
                                                        palveluKayttooikeusSelection={this.state.palveluKayttooikeusSelection}
                                                        lisaaPalveluJaKayttooikeusAction={this._onLisaaPalveluJaKayttooikeus}

                                                        palveluJaKayttooikeusSelections={this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections}
                                                        removePalveluJaKayttooikeus={this._onRemovePalveluJaKayttooikeus}
            />

            <div className="kayttooikeusryhmat-lisaa-page-buttons">
                <button disabled={!this._validateKayttooikeusryhmaInputs()} className="oph-button oph-button-primary"
                        onClick={() => {
                            this.props.kayttooikeusryhmaId ?
                                this.updateKayttooikeusryhma() :
                                this.createNewKayttooikeusryhma()
                        }}><SpinnerInButton show={this.state.toggleTallenna}></SpinnerInButton> {this.props.L['TALLENNA']}</button>
                <button className="oph-button oph-button-cancel" onClick={() => {this.cancel()}}>
                    {this.props.L['PERUUTA']}
                </button>
                {
                    this.props.kayttooikeusryhmaId ?
                        <button className="oph-button oph-button-cancel"
                                onClick={() => {this.setState({ showPassivoiModal: true })}}>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI']}</button>
                        : null
                }

            </div>

            <LocalNotification toggle={!this._validateKayttooikeusryhmaInputs()} type={'info'} title={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVA_TIETO_OTSIKKO']}>
                <ul>
                    { this._validateKayttooikeusryhmaNimet() ? null : <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_NIMI']}</li> }
                    { this._validateKayttooikeusryhmaDescriptions() ? null : <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_KUVAUS']}</li>}
                    { this._validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections() ? null : <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_PALVELUKAYTTOOIKEUS']}</li>}
                </ul>
            </LocalNotification>

            <LocalNotification toggle={this.state.toggleErrorOnSave} type={'error'} title={this.props.L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE']}></LocalNotification>
            {this.state.showPassivoiModal ?
                <OphModal title={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI_VARMISTUS']} onClose={() => {this.setState({showPassivoiModal: false})}}>
                    <div className="passivoi-modal">
                        <button className="oph-button oph-button-primary"
                            onClick={() => {this._passivoiKayttooikeusryhma()}}><SpinnerInButton show={this.state.togglePassivoi}></SpinnerInButton>  {this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI']}</button>
                        <button className="oph-button oph-button-cancel" onClick={() => { this.setState({ showPassivoiModal: false }) }}>{this.props.L['PERUUTA']}</button>
                    </div>
                </OphModal> :
                null }
        </div>
    }

    _passivoiKayttooikeusryhma = (): void => {
        this.setState( { showPassivoiModal: false}, () => {
            this.passivoiKayttooikeusryhma();
        });
    };

    _parseExistingKayttooikeusryhmaData = (kayttooikeusryhmaState: any): KayttooikeusryhmaForm => {
        return {
            name: this._parseExistingTextsData(R.path(['kayttooikeusryhma', 'nimi', 'texts'], kayttooikeusryhmaState)),
            description: this._parseExistingTextsData(R.path(['kayttooikeusryhma', 'kuvaus', 'texts'], kayttooikeusryhmaState)),
            organisaatioSelections: this._parseExistingOrganisaatioData(R.path(['kayttooikeusryhma', 'organisaatioViite'], kayttooikeusryhmaState)),
            oppilaitostyypitSelections: this._parseExistingOppilaitostyyppiData(R.path(['kayttooikeusryhma', 'organisaatioViite'], kayttooikeusryhmaState)),
            ryhmaRestriction: this._parseExistingRyhmaRestriction(kayttooikeusryhmaState),
            kayttooikeusryhmaSelections: this._parseExistingKayttooikeusryhmaSelections(kayttooikeusryhmaState.kayttooikeusryhmaSlaves),
            palveluJaKayttooikeusSelections: this._parseExistingPalvelutRoolitData(kayttooikeusryhmaState.palvelutRoolit),
        };
    };

    _parseExistingRyhmaRestriction = (kayttooikeusryhmaState: any): boolean => {
        const organisaatioViitteet = R.path(['kayttooikeusryhma', 'organisaatioViite'], kayttooikeusryhmaState);
        const organisaatioViiteRyhmaRestriction: boolean = organisaatioViitteet.length > 0 ? organisaatioViitteet.some( (organisaatioviite: any) => this._isRyhmaOid(organisaatioviite.organisaatioTyyppi)) : false;
        const ryhmaRestriction: any = R.path(['kayttooikeusryhma', 'ryhmaRestriction'], kayttooikeusryhmaState);
        return organisaatioViiteRyhmaRestriction || ryhmaRestriction;
    };

    _parseExistingKayttooikeusryhmaSelections = (slaves: any): Array<ReactSelectOption> => {
        return slaves.map((slave: Kayttooikeusryhma) => {
            const text: any = R.find((text: any) => text.lang.toLowerCase() === this.props.locale)(slave.nimi.texts);
            return {
                value: slave.id,
                label: text.text
            }
        });
    };

    _parseExistingTextsData = (texts: any): any => {
        const result: any = {fi: '', sv: '', en: ''};
        if (texts === undefined) {
            return result;
        }
        texts.forEach((text: Text) => {
            result[text.lang.toLowerCase()] = text.text;
        });
        return result;
    };

    _parseExistingOrganisaatioData = (organisaatioViitteet: any): Array<OrganisaatioSelectObject> => {
        if(Object.keys(this.props.organisaatioCache).length === 0) {
            return [];
        }
        const organisaatioViittees = organisaatioViitteet
            .filter((organisaatioViite: any) => this._isOrganisaatioOid(organisaatioViite.organisaatioTyyppi));
        const organisaatioOids = organisaatioViittees
            .map((organisaatioViite: any) => organisaatioViite.organisaatioTyyppi);
        return organisaatioOids
            .map( (oid: string) => this.props.organisaatioCache[oid])
            .map( (organisaatio: any) => ({
                oid: organisaatio.oid,
                name: getLocalization(organisaatio.nimi, this.props.locale),
                parentNames: [],
                organisaatioTyypit: []
            }));
    };

    _isOrganisaatioOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] === '10';
    };

    _isOppilaitosId = (input: string): boolean => {
        return input.split('.')[4] === undefined;
    };

    _isRyhmaOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] !== '10';
    };

    _parseExistingOppilaitostyyppiData = (organisaatioViitteet: any): Array<ReactSelectOption> => {
        const oppilaitostyypit: any = this.props.koodisto.oppilaitostyypit
            .map(oppilaitostyyppi => ({label: oppilaitostyyppi[this.props.locale], value: oppilaitostyyppi.value}));
        const oppilaitosOrganisaatioViiteet = organisaatioViitteet
            .filter((organisaatioViite: any) => this._isOppilaitosId(organisaatioViite.organisaatioTyyppi));
        const ids = oppilaitosOrganisaatioViiteet.map((item: any) => item.organisaatioTyyppi);
        return oppilaitostyypit.filter((oppilaitostyyppi: any) => R.contains(oppilaitostyyppi.value.toString(), ids));
    };

    _parseExistingPalvelutRoolitData = (palvelutRoolit: Array<PalveluRooli>): Array<any> => {
        return palvelutRoolit.map((palveluRooli: any) => {
            const matchLocale = (text: any) => text.lang.toLowerCase() === this.props.locale;
            const palveluLabel: any = R.find(matchLocale)(palveluRooli.palveluTexts);
            const kayttooikeusLabel: any = R.find(matchLocale)(palveluRooli.rooliTexts);
            return {
                palvelu: {value: palveluRooli.palveluName, label: palveluLabel.text},
                kayttooikeus: {value: palveluRooli.rooli, label: kayttooikeusLabel.text}
            }
        });
    };

    _toggleRyhmaRestriction = () => {
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                ryhmaRestriction: !this.state.kayttooikeusryhmaForm.ryhmaRestriction
            }
        });
    };

    _onOrganisaatioSelection = (selection: OrganisaatioSelectObject): void => {
        const currentOrganisaatioSelections: Array<OrganisaatioSelectObject> = this.state.kayttooikeusryhmaForm.organisaatioSelections;
        if (!currentOrganisaatioSelections.some(organisaatio => organisaatio.oid === selection.oid)) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    organisaatioSelections: [...currentOrganisaatioSelections, selection]
                }
            });
        }
    };

    _onRemoveOrganisaatioSelect = (selection: OrganisaatioSelectObject): void => {
        const newOrganisaatioSelections: Array<OrganisaatioSelectObject> = this.state.kayttooikeusryhmaForm.organisaatioSelections
            .filter(organisaatio => selection.oid !== organisaatio.oid);
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                organisaatioSelections: newOrganisaatioSelections
            }
        });
    };

    _onOppilaitostyypitSelection = (selection: ReactSelectOption): void => {
        const currentOppilaitostyypitSelections: Array<ReactSelectOption> = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections;
        if (!currentOppilaitostyypitSelections.some((oppilaitostyyppi: ReactSelectOption) => oppilaitostyyppi.value === selection.value)) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    oppilaitostyypitSelections: [...currentOppilaitostyypitSelections, selection]
                }
            });
        }
    };

    _onRemoveOppilaitostyypitSelect = (selection: ReactSelectOption): void => {
        const newOppilaitostyypitSelections: Array<ReactSelectOption> = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections
            .filter((oppilaitostyyppi: ReactSelectOption) => selection.value !== oppilaitostyyppi.value);
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                oppilaitostyypitSelections: newOppilaitostyypitSelections
            }
        });
    };

    _setName = (languageCode: string, value: string): void => {
        this.setState({
            kayttooikeusryhmaForm:
                {
                    ...this.state.kayttooikeusryhmaForm,
                    name: {...this.state.kayttooikeusryhmaForm.name, [languageCode]: value}
                }
        })
    };

    _setDescription = (languageCode: string, value: string): void => {
        this.setState({
            kayttooikeusryhmaForm:
                {
                    ...this.state.kayttooikeusryhmaForm,
                    description: {...this.state.kayttooikeusryhmaForm.description, [languageCode]: value}
                }
        })
    };

    _onKayttooikeusryhmaSelection = (selection: ReactSelectOption): void => {
        const currentKayttooikeusryhmaSelections: Array<ReactSelectOption> = this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections;
        if (!currentKayttooikeusryhmaSelections.some((kayttooikeusryhma: ReactSelectOption) => kayttooikeusryhma.value === selection.value)) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    kayttooikeusryhmaSelections: [...currentKayttooikeusryhmaSelections, selection]
                }
            });
        }
    };

    _onRemoveKayttooikeusryhmaSelect = (selection: ReactSelectOption): void => {
        const newKayttooikeusryhmaSelections: Array<ReactSelectOption> = this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections
            .filter((kayttooikeusryhma: ReactSelectOption) => kayttooikeusryhma.value !== selection.value);
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                kayttooikeusryhmaSelections: newKayttooikeusryhmaSelections
            }
        });
    };

    _onPalvelutSelection = (selection: ReactSelectOption): void => {
        this.setState({palvelutSelection: selection, palveluKayttooikeusSelection: undefined});
        this.props.fetchPalveluKayttooikeus(selection.value);
    };

    _onPalveluKayttooikeusSelection = (selection: ReactSelectOption): void => {
        this.setState({palveluKayttooikeusSelection: selection});
    };

    _onLisaaPalveluJaKayttooikeus = (): void => {
        const {palvelutSelection, palveluKayttooikeusSelection}: any = this.state;
        const newKayttoikeusSelection: PalveluJaKayttooikeusSelection = {
            palvelu: palvelutSelection,
            kayttooikeus: palveluKayttooikeusSelection
        };
        const currentKayttooikeusSelections = this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections;
        if (!currentKayttooikeusSelections.some((kayttooikeusSelection: PalveluJaKayttooikeusSelection) =>
                (kayttooikeusSelection.palvelu.value === newKayttoikeusSelection.palvelu.value &&
                    kayttooikeusSelection.kayttooikeus.value === newKayttoikeusSelection.kayttooikeus.value))) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    palveluJaKayttooikeusSelections: [...currentKayttooikeusSelections, newKayttoikeusSelection]
                },
                palveluKayttooikeusSelection: undefined
            })
        }
    };

    _onRemovePalveluJaKayttooikeus = (removeItem: PalveluJaKayttooikeusSelection): void => {
        const newPalveluJaKayttooikeusSelections = this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.filter(
            (currentItem: PalveluJaKayttooikeusSelection) => !((removeItem.kayttooikeus.value === currentItem.kayttooikeus.value) && (removeItem.palvelu.value === currentItem.palvelu.value)));
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                palveluJaKayttooikeusSelections: newPalveluJaKayttooikeusSelections
            }
        });
    };

    _validateKayttooikeusryhmaInputs = (): boolean => {
        return this._validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections()
            && this._validateKayttooikeusryhmaDescriptions()
            && this._validateKayttooikeusryhmaNimet();
    };

    _validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections = (): boolean => {
        return this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.length > 0;
    };

    _validateKayttooikeusryhmaDescriptions = (): boolean => {
        const description = this.state.kayttooikeusryhmaForm.description;
        return description.fi.length > 0 && description.sv.length > 0 && description.en.length > 0;
    };

    _validateKayttooikeusryhmaNimet = (): boolean => {
        const name = this.state.kayttooikeusryhmaForm.name;
        return name.fi.length > 0 && name.sv.length > 0 && name.en.length > 0;
    };

    _parseNameData = (): TextGroup => {
        const name = this.state.kayttooikeusryhmaForm.name;
        const texts: any = Object.keys(name).map(
            (key: string) => ({lang: key.toUpperCase(), text: name[key]})
        );
        return {texts};
    };

    _parseDescriptionData = (): TextGroup => {
        const description = this.state.kayttooikeusryhmaForm.description;
        const texts: any = Object.keys(description).map(
            (key: string) => ({lang: key.toUpperCase(), text: description[key]})
        );
        return {texts};
    };

    _parsePalvelutRoolit = (): Array<PalveluRooliModify> => {
        return this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections
            .map((item: PalveluJaKayttooikeusSelection) => ({
                palveluName: item.palvelu.value,
                rooli: item.kayttooikeus.value
            }));
    };

    _parseSlaveIds = (): Array<number> => {
        return this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections.map((selection: ReactSelectOption) => parseInt(selection.value, 10));
    };

    _parseOrganisaatioTyypit = (): Array<string> => {
        const organisaatioTyypit = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections
            .map((item: ReactSelectOption) => item.value);
        const organisaatiot = this.state.kayttooikeusryhmaForm.organisaatioSelections
            .map((item: OrganisaatioSelectObject) => item.oid);
        const ryhmaRestrictionviite = this.state.ryhmaRestrictionViite ? [this.state.ryhmaRestrictionViite.organisaatioTyyppi] : [];
        return this.state.ryhmaRestrictionViite ? organisaatioTyypit.concat(organisaatiot).concat(ryhmaRestrictionviite) : organisaatioTyypit.concat(organisaatiot);
    };

    cancel = (): void => {
        this.props.router.push('/kayttooikeusryhmat');
    };

    parsePayload = () => ({
        nimi: this._parseNameData(),
        kuvaus: this._parseDescriptionData(),
        palvelutRoolit: this._parsePalvelutRoolit(),
        rooliRajoite: null,
        ryhmaRestriction: this.state.kayttooikeusryhmaForm.ryhmaRestriction,
        organisaatioTyypit: this._parseOrganisaatioTyypit(),
        slaveIds: this._parseSlaveIds()
    });

    async passivoiKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id.passivoi', this.props.kayttooikeusryhmaId);
        try {
            this.setState({togglePassivoi: true});
            await http.put(url);
            this.setState({togglePassivoi: false}, () => {
                this.props.router.push('/kayttooikeusryhmat');
            });
        } catch (error) {
            this.setState({toggleErrorOnSave: true});
            throw error;
        }
    }

    async createNewKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma');
        try {
            this.setState({toggleTallenna: true});
            await http.post(url, this.parsePayload());
            this.setState({toggleTallenna: false}, () => {
              this.props.router.push('/kayttooikeusryhmat');
            });
        } catch (error) {
            this.setState({toggleErrorOnSave: true});
            throw error;
        }
    }

    async updateKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id', this.props.kayttooikeusryhmaId);
        try {
            this.setState({toggleTallenna: true});
            await http.put(url, this.parsePayload());
            this.setState({toggleTallenna: false}, () => {
                this.props.router.push('/kayttooikeusryhmat');
            });
        } catch (error) {
            this.setState({toggleErrorOnSave: true});
            throw error;
        }
    }

}