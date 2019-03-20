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
import type {TextGroupModify} from "../../../types/domain/kayttooikeus/textgroup.types";
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
import {SpinnerInButton} from "../../common/icons/SpinnerInButton";
import type {Localisations} from "../../../types/localisation.type";
import type {OrganisaatioHenkilo} from "../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import {LocalNotification} from "../../common/Notification/LocalNotification";
import type {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types";
import {getLocalization} from "../../../utilities/localisation.util";
import {NOTIFICATIONTYPES} from "../../common/Notification/notificationtypes";
import type {GlobalNotificationConfig} from "../../../types/notification.types";
import type {KoodistoState} from "../../../reducers/koodisto.reducer";
import KayttooikeusryhmatSallittuKayttajatyyppi from "./KayttooikeusryhmatSallittuKayttajatyyppi";
import type {KayttooikeusRyhmaState} from "../../../reducers/kayttooikeusryhma.reducer";
import ToggleKayttooikeusryhmaStateModal from "./ToggleKayttooikeusryhmaStateModal";

export type KayttooikeusryhmaNimi = {
    FI: string,
    SV: string,
    EN: string
}

export type KayttooikeusryhmaKuvaus = {
    FI: string,
    SV: string,
    EN: string
}

export type PalveluJaKayttooikeusSelection = {
    palvelu: ReactSelectOption,
    kayttooikeus: ReactSelectOption
}

export type SallitutKayttajatyypit = 'PALVELU' | 'VIRKAILIJA';

export type KayttooikeusryhmaForm = {
    name: KayttooikeusryhmaNimi,
    description: KayttooikeusryhmaKuvaus,
    ryhmaRestriction: boolean,
    organisaatioSelections: Array<OrganisaatioSelectObject>,
    oppilaitostyypitSelections: Array<string>,
    organisaatiotyypitSelections: Array<string>,
    kayttooikeusryhmaSelections: Array<ReactSelectOption>,
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>,
    sallittuKayttajatyyppi: ?SallitutKayttajatyypit,
}

type Props = {
    L: Localisations,
    router: any,
    organisaatios: Array<OrganisaatioHenkilo>,
    koodisto: KoodistoState,
    kayttooikeus: KayttooikeusRyhmaState,
    kayttooikeusState: KayttooikeusState,
    palvelutState: PalvelutState,
    locale: Locale,
    fetchPalveluKayttooikeus: (palveluName: string) => void,
    omattiedotOrganisaatiosLoading: boolean,
    kayttooikeusryhmaId?: string,
    organisaatioCache: any,
    addGlobalNotification: (payload: GlobalNotificationConfig) => void
}

type State = {
    kayttooikeusryhmaForm: KayttooikeusryhmaForm,
    palvelutSelection: ReactSelectOption | void,
    palveluKayttooikeusSelection: ReactSelectOption | void,
    ryhmaRestrictionViite: any,
    toggleTallenna: boolean,
    organisaatios: Array<OrganisaatioSelectObject>,
    isPassivoitu: boolean,
};

export default class KayttooikeusryhmaPage extends React.Component<Props, State> {

    state = {
        kayttooikeusryhmaForm: {
            name: {FI: '', SV: '', EN: ''},
            description: {FI: '', SV: '', EN: ''},
            organisaatioSelections: [],
            oppilaitostyypitSelections: [],
            organisaatiotyypitSelections: [],
            ryhmaRestriction: false,
            kayttooikeusryhmaSelections: [],
            palveluJaKayttooikeusSelections: [],
            sallittuKayttajatyyppi: null,
        },
        palvelutSelection: undefined,
        palveluKayttooikeusSelection: undefined,
        isPassivoitu: false,
        ryhmaRestrictionViite: undefined,
        toggleTallenna: false,
        organisaatios: []
    };

    componentDidMount() {
        if (this.props.kayttooikeusryhmaId) {
            const kayttooikeusryhmaForm: KayttooikeusryhmaForm = this._parseExistingKayttooikeusryhmaData(this.props.kayttooikeus);
            const organisaatioViitteet = R.path(['kayttooikeusryhma', 'organisaatioViite'], this.props.kayttooikeus) || [];
            const ryhmaRestrictionViite = this._parseExistingRyhmaRestrictionViite(organisaatioViitteet);
            const organisaatios = omattiedotOrganisaatiotToOrganisaatioSelectObject(this.props.organisaatios, this.props.locale);
            const isPassivoitu = !!R.path(['kayttooikeusryhma', 'passivoitu'], this.props.kayttooikeus);
            const newState = { kayttooikeusryhmaForm, ryhmaRestrictionViite, organisaatios, isPassivoitu};
            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps: Props): void {
        if(this.state.organisaatios.length === 0 && Object.keys(nextProps.organisaatioCache).length > 0) {
            const organisaatioSelections: Array<OrganisaatioSelectObject> = this._parseExistingOrganisaatioData(R.path(['kayttooikeusryhma', 'organisaatioViite'], this.props.kayttooikeus), nextProps.organisaatioCache);
            this.setState({kayttooikeusryhmaForm: {...this.state.kayttooikeusryhmaForm, organisaatioSelections }})
        }
    }

    _parseExistingRyhmaRestrictionViite = (organisaatioViitteet: any): any => {
        return R.find( (viite) => this._isRyhmaOid(viite.organisaatioTyyppi))(organisaatioViitteet);
    };

    render() {
        return <div className="wrapper">
            <span className="oph-h2 oph-bold kayttooikeusryhma-header">{this.props.L['KAYTTOOIKEUSRYHMAT_OTSIKKO'] + this.getStatusString()}</span>
            <KayttooikeusryhmatNimi {...this.props}
                                    name={this.state.kayttooikeusryhmaForm.name}
                                    setName={this._setName}
            />

            <KayttooikeusryhmatKuvaus {...this.props}
                                      description={this.state.kayttooikeusryhmaForm.description}
                                      setDescription={this._setDescription}
            />

            <KayttooikeusryhmatSallittuKayttajatyyppi kayttajaTyyppi={this.state.kayttooikeusryhmaForm.sallittuKayttajatyyppi}
                                                      setSallittuKayttajatyyppi={this._toggleSallittuKayttajatyyppiPalvelu}
            />

            <KayttooikeusryhmanOrganisaatiorajoite {...this.props}
                                                   ryhmaRestriction={this.state.kayttooikeusryhmaForm.ryhmaRestriction}
                                                   toggleRyhmaRestriction={this._toggleRyhmaRestriction}
                                                   organisaatioSelectAction={this._onOrganisaatioSelection}
                                                   organisaatioSelections={this.state.kayttooikeusryhmaForm.organisaatioSelections}
                                                   removeOrganisaatioSelectAction={this._onRemoveOrganisaatioSelect}
                                                   oppilaitostyypitSelectAction={this._onOppilaitostyypitSelection}
                                                   oppilaitostyypitSelections={this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections}
                                                   organisaatiotyypitSelectAction={this._onOrganisaatiotyypitSelection}
                                                   organisaatiotyypitSelections={this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections}
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
                <ToggleKayttooikeusryhmaStateModal
                    router={this.props.router}
                    kayttooikeusryhmaId={this.props.kayttooikeusryhmaId}
                />
            </div>

            <LocalNotification toggle={!this._validateKayttooikeusryhmaInputs()} type={'info'} title={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVA_TIETO_OTSIKKO']}>
                <ul>
                    { this._validateKayttooikeusryhmaNimet() ? null : <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_NIMI']}</li> }
                    { this._validateKayttooikeusryhmaDescriptions() ? null : <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_KUVAUS']}</li>}
                    { this._validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections() ? null : <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_PALVELUKAYTTOOIKEUS']}</li>}
                </ul>
            </LocalNotification>


            <LocalNotification toggle={this._hasPassiveOrganisaatioRajoite.call(this)}
                               type={NOTIFICATIONTYPES.WARNING}
                               title={this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU_VAROITUS']}/>
        </div>
    }

    _parseExistingKayttooikeusryhmaData = (kayttooikeusryhmaState: KayttooikeusRyhmaState): KayttooikeusryhmaForm => {
        const organisaatioviiteData = R.path(['kayttooikeusryhma', 'organisaatioViite'], kayttooikeusryhmaState);
        return {
            name: this._parseExistingTextsData(R.path(['kayttooikeusryhma', 'nimi', 'texts'], kayttooikeusryhmaState)),
            description: this._parseExistingTextsData(R.path(['kayttooikeusryhma', 'kuvaus', 'texts'], kayttooikeusryhmaState)),
            organisaatioSelections: organisaatioviiteData ? this._parseExistingOrganisaatioData(organisaatioviiteData, this.props.organisaatioCache) : [],
            oppilaitostyypitSelections: organisaatioviiteData ? this._parseExistingOppilaitostyyppiData(organisaatioviiteData) : [],
            organisaatiotyypitSelections: organisaatioviiteData ? this._parseExistingOrganisaatiotyyppiData(organisaatioviiteData) : [],
            ryhmaRestriction: this._parseExistingRyhmaRestriction(kayttooikeusryhmaState),
            kayttooikeusryhmaSelections: this._parseExistingKayttooikeusryhmaSelections(kayttooikeusryhmaState.kayttooikeusryhmaSlaves),
            palveluJaKayttooikeusSelections: this._parseExistingPalvelutRoolitData(kayttooikeusryhmaState.palvelutRoolit),
            sallittuKayttajatyyppi: R.path(['kayttooikeusryhma', 'sallittuKayttajatyyppi'], kayttooikeusryhmaState),
        };
    };

    _parseExistingRyhmaRestriction = (kayttooikeusryhmaState: KayttooikeusRyhmaState): boolean => {
        const organisaatioViitteet = R.path(['kayttooikeusryhma', 'organisaatioViite'], kayttooikeusryhmaState) || [];
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
        const result: any = {FI: '', SV: '', EN: ''};
        if (texts === undefined) {
            return result;
        }
        texts.forEach((text: Text) => {
            result[text.lang] = text.text;
        });
        return result;
    };

    _parseExistingOrganisaatioData = (organisaatioViitteet: any, organisaatioCache: {[string]: any}): Array<OrganisaatioSelectObject> => {
        if(Object.keys(organisaatioCache).length === 0 || !organisaatioViitteet) {
            return [];
        }
        const organisaatioViittees = organisaatioViitteet
            .filter((organisaatioViite: any) => this._isOrganisaatioOid(organisaatioViite.organisaatioTyyppi));
        const organisaatioOids = organisaatioViittees
            .map((organisaatioViite: any) => organisaatioViite.organisaatioTyyppi);
        return organisaatioOids.map( (oid: string) => organisaatioCache[oid])
            .map( (organisaatio: any) => {
                const localizedName = getLocalization(organisaatio.nimi, this.props.locale);
                const name = organisaatio.status === 'AKTIIVINEN' ? localizedName : `${localizedName} (${this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})`;
                return {
                    oid: organisaatio.oid,
                    name ,
                    parentNames: [],
                    organisaatioTyypit: []
                }
            });
    };

    _isOrganisaatioOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] === '10';
    };

    _isOppilaitosId = (input: string): boolean => {
        return !this._isOrganisaatioOid(input) && !this._isOrganisaatiotyyppi(input) && !this._isRyhmaOid(input);
    };

    _isOrganisaatiotyyppi = (input: string): boolean => {
        return input.startsWith('organisaatiotyyppi_');
    };

    _isRyhmaOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] !== '10';
    };

    _parseExistingOppilaitostyyppiData = (organisaatioViitteet: any): Array<string> => {
        const oppilaitostyypit: Array<string> = this.props.koodisto.oppilaitostyypit
            .map(oppilaitostyyppiKoodi => (oppilaitostyyppiKoodi.value));
        const oppilaitosOrganisaatioViiteet = organisaatioViitteet
            .filter((organisaatioViite: any) => this._isOppilaitosId(organisaatioViite.organisaatioTyyppi));
        const ids = oppilaitosOrganisaatioViiteet.map((item: any) => item.organisaatioTyyppi);
        return oppilaitostyypit.filter((oppilaitostyyppi: string) => R.contains(oppilaitostyyppi, ids));
    };

    _parseExistingOrganisaatiotyyppiData = (organisaatioViitteet: any): Array<string> => {
        const organisaatiotyypit: Array<string> = this.props.koodisto.organisaatiotyyppiKoodisto
            .map(organisaatiotyyppiKoodi => (organisaatiotyyppiKoodi.koodiUri));
        const organisaatiotyyppiOrganisaatioViiteet = organisaatioViitteet
            .filter((organisaatioViite: any) => this._isOrganisaatiotyyppi(organisaatioViite.organisaatioTyyppi));
        const ids = organisaatiotyyppiOrganisaatioViiteet.map((item: any) => item.organisaatioTyyppi);
        return organisaatiotyypit.filter((organisaatiotyyppi: string) => R.contains(organisaatiotyyppi, ids));
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

    _toggleSallittuKayttajatyyppiPalvelu = () => {
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                sallittuKayttajatyyppi: this.state.kayttooikeusryhmaForm.sallittuKayttajatyyppi === 'PALVELU' ? null : 'PALVELU',
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

    _onOppilaitostyypitSelection = (selection: SyntheticInputEvent<HTMLInputElement>): void => {
        if (selection.target.checked) {
            const currentOppilaitostyypitSelections: Array<string> = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections;
            if (!currentOppilaitostyypitSelections.some((oppilaitostyyppi: string) => oppilaitostyyppi === selection.target.value)) {
                this.setState({
                    kayttooikeusryhmaForm: {
                        ...this.state.kayttooikeusryhmaForm,
                        oppilaitostyypitSelections: [...currentOppilaitostyypitSelections, selection.target.value]
                    }
                });
            }
        }
        else {
            const newOppilaitostyypitSelections: Array<string> = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections
                .filter((oppilaitostyyppi: string) => selection.target.value !== oppilaitostyyppi);
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    oppilaitostyypitSelections: newOppilaitostyypitSelections
                }
            });
        }
    };

    _onOrganisaatiotyypitSelection = (selection: SyntheticInputEvent<HTMLInputElement>): void => {
        if (selection.target.checked) {
            const currentOrganisaatiotyypitSelections: Array<string> = this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections;
            if (!currentOrganisaatiotyypitSelections.some((organisaatiotyyppi: string) => organisaatiotyyppi === selection.target.value)) {
                this.setState({
                    kayttooikeusryhmaForm: {
                        ...this.state.kayttooikeusryhmaForm,
                        organisaatiotyypitSelections: [...currentOrganisaatiotyypitSelections, selection.target.value]
                    }
                });
            }
        }
        else {
            const newOrganisaatiotyypitSelections: Array<string> = this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections
                .filter((organisaatiotyyppi: string) => selection.target.value !== organisaatiotyyppi);
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    organisaatiotyypitSelections: newOrganisaatiotyypitSelections
                }
            });
        }
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
        return description.FI.length > 0 && description.SV.length > 0 && description.EN.length > 0;
    };

    _validateKayttooikeusryhmaNimet = (): boolean => {
        const name = this.state.kayttooikeusryhmaForm.name;
        return name.FI.length > 0 && name.SV.length > 0 && name.EN.length > 0;
    };

    _parseNameData = (): TextGroupModify => {
        const name = this.state.kayttooikeusryhmaForm.name;
        const texts: Array<Text> = Object.keys(name).map(
            (key) => ({lang: key, text: name[key]})
        );
        return {texts};
    };

    _parseDescriptionData = (): TextGroupModify => {
        const description = this.state.kayttooikeusryhmaForm.description;
        const texts: Array<Text> = Object.keys(description).map(
            (key) => ({lang: key, text: description[key]})
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
        const oppilaitostyypit = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections;
        const organisaatiotyypit = this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections;
        const tyypit = oppilaitostyypit.concat(organisaatiotyypit);
        const organisaatiot = this.state.kayttooikeusryhmaForm.organisaatioSelections
            .map((item: OrganisaatioSelectObject) => item.oid);
        const ryhmaRestrictionviite = this.state.ryhmaRestrictionViite ? [this.state.ryhmaRestrictionViite.organisaatioTyyppi] : [];
        return this.state.ryhmaRestrictionViite ? tyypit.concat(organisaatiot).concat(ryhmaRestrictionviite) : tyypit.concat(organisaatiot);
    };

    _hasPassiveOrganisaatioRajoite = (): boolean => {
        const passivoitu = this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU'];
        const organisaatioSelections = this.state.kayttooikeusryhmaForm.organisaatioSelections;
        return organisaatioSelections && organisaatioSelections.some( (selection: OrganisaatioSelectObject) => selection.name.includes(passivoitu));
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
        slaveIds: this._parseSlaveIds(),
        sallittuKayttajatyyppi: this.state.kayttooikeusryhmaForm.sallittuKayttajatyyppi,
    });

    async createNewKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma');
        try {
            this.setState({toggleTallenna: true});
            await http.post(url, this.parsePayload());
            this.setState({toggleTallenna: false}, () => {
                this.props.router.push('/kayttooikeusryhmat');
            });
        } catch (error) {
            this.props.addGlobalNotification({
                key: 'UUDENKAYTTOIKEUSRYHMANLUONTIVIRHE',
                title: this.props.L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000
            });
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
            this.props.addGlobalNotification({
                key: 'KAYTTOOIKEUSRYHMANPAIVITYSVIRHE',
                title: this.props.L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000
            });
            throw error;
        }
    }

    getStatusString() {
        return this.state.isPassivoitu ? ` (${this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})` : '';
    }
}
