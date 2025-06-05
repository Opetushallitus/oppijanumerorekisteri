import React from 'react';
import moment from 'moment';
import { RouteActions } from 'react-router-redux';

import './KayttooikeusryhmaPage.css';
import KayttooikeusryhmanOrganisaatiorajoite from './KayttooikeusryhmanOrganisaatiorajoite';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';
import MyonnettavatKayttooikeusryhmat from './MyonnettavatKayttooikeusryhmat';
import KayttooikeusryhmatPalvelutJaKayttooikeudet from './KayttooikeusryhmatPalvelutJaKayttooikeudet';
import { Locale } from '../../../types/locale.type';
import { TextGroupModify } from '../../../types/domain/kayttooikeus/textgroup.types';
import { PalveluRooliModify } from '../../../types/domain/kayttooikeus/PalveluRooliModify.types';
import { http } from '../../../http';
import { urls } from 'oph-urls-js';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { Text } from '../../../types/domain/kayttooikeus/text.types';
import { PalveluRooli } from '../../../types/domain/kayttooikeus/PalveluRooli.types';
import { SpinnerInButton } from '../../common/icons/SpinnerInButton';
import { Localisations } from '../../../types/localisation.type';
import { LocalNotification } from '../../common/Notification/LocalNotification';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { getLocalization } from '../../../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { KoodistoState } from '../../../reducers/koodisto.reducer';
import KayttooikeusryhmatSallittuKayttajatyyppi from './KayttooikeusryhmatSallittuKayttajatyyppi';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import ToggleKayttooikeusryhmaStateModal from './ToggleKayttooikeusryhmaStateModal';
import PropertySingleton from '../../../globals/PropertySingleton';
import { OrganisaatioViite } from '../../../types/domain/kayttooikeus/organisaatioviite.types';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';
import { SelectOption } from '../../../utilities/select';

type Locales = 'FI' | 'SV' | 'EN';

export type LocalizableField = Record<Locales, string>;

export type PalveluJaKayttooikeusSelection = {
    palvelu: SelectOption;
    kayttooikeus: SelectOption;
};

export type SallitutKayttajatyypit = 'PALVELU' | 'VIRKAILIJA';

export type KayttooikeusryhmaForm = {
    name: LocalizableField;
    description: LocalizableField;
    ryhmaRestriction: boolean;
    organisaatioSelections: Array<OrganisaatioSelectObject>;
    oppilaitostyypitSelections: Array<string>;
    organisaatiotyypitSelections: Array<string>;
    kayttooikeusryhmaSelections: SelectOption[];
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>;
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null | undefined;
};

type Props = {
    L: Localisations;
    router: RouteActions;
    koodisto: KoodistoState;
    kayttooikeus: KayttooikeusRyhmaState;
    locale: Locale;
    kayttooikeusryhmaId?: string;
    organisaatioCache: OrganisaatioCache;
    addGlobalNotification: (payload: GlobalNotificationConfig) => void;
};

type State = {
    kayttooikeusryhmaForm: KayttooikeusryhmaForm;
    palvelutSelection: SelectOption;
    palveluKayttooikeusSelection: SelectOption;
    ryhmaRestrictionViite?: OrganisaatioViite;
    toggleTallenna: boolean;
    organisaatios: Array<OrganisaatioSelectObject>;
    isPassivoitu: boolean;
};

export default class KayttooikeusryhmaPage extends React.Component<Props, State> {
    state: State = {
        kayttooikeusryhmaForm: {
            name: { FI: '', SV: '', EN: '' },
            description: { FI: '', SV: '', EN: '' },
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
        organisaatios: [],
    };

    componentDidMount() {
        if (this.props.kayttooikeusryhmaId) {
            const kayttooikeusryhmaForm: KayttooikeusryhmaForm = this._parseExistingKayttooikeusryhmaData(
                this.props.kayttooikeus
            );
            const organisaatioViitteet = this.props.kayttooikeus.kayttooikeusryhma?.organisaatioViite || [];
            const ryhmaRestrictionViite = this._parseExistingRyhmaRestrictionViite(organisaatioViitteet);
            const isPassivoitu = !!this.props.kayttooikeus.kayttooikeusryhma?.passivoitu;
            const newState = {
                kayttooikeusryhmaForm,
                ryhmaRestrictionViite,
                isPassivoitu,
            };
            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps: Props): void {
        if (this.state.organisaatios.length === 0 && Object.keys(nextProps.organisaatioCache).length > 0) {
            const organisaatioSelections: Array<OrganisaatioSelectObject> = this._parseExistingOrganisaatioData(
                this.props.kayttooikeus.kayttooikeusryhma?.organisaatioViite,
                nextProps.organisaatioCache
            );
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    organisaatioSelections,
                },
            });
        }
    }

    _parseExistingRyhmaRestrictionViite = (
        organisaatioViitteet: OrganisaatioViite[]
    ): OrganisaatioViite | undefined => {
        return organisaatioViitteet.find((viite) => this._isRyhmaOid(viite.organisaatioTyyppi));
    };

    render() {
        return (
            <div className="mainContent wrapper">
                <span className="oph-h2 oph-bold kayttooikeusryhma-header">
                    {this.props.L['KAYTTOOIKEUSRYHMAT_OTSIKKO'] + this.getStatusString()}
                </span>
                <KayttooikeusryhmatNimi
                    {...this.props}
                    name={this.state.kayttooikeusryhmaForm.name}
                    setName={this._setName}
                />

                <KayttooikeusryhmatKuvaus
                    {...this.props}
                    description={this.state.kayttooikeusryhmaForm.description}
                    setDescription={this._setDescription}
                />

                <KayttooikeusryhmatSallittuKayttajatyyppi
                    kayttajaTyyppi={this.state.kayttooikeusryhmaForm.sallittuKayttajatyyppi}
                    setSallittuKayttajatyyppi={this._toggleSallittuKayttajatyyppiPalvelu}
                />

                <KayttooikeusryhmanOrganisaatiorajoite
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

                <MyonnettavatKayttooikeusryhmat
                    kayttooikeusryhmaSelectAction={this._onKayttooikeusryhmaSelection}
                    kayttooikeusryhmaSelections={this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections}
                    removeKayttooikeusryhmaSelectAction={this._onRemoveKayttooikeusryhmaSelect}
                />

                <KayttooikeusryhmatPalvelutJaKayttooikeudet
                    palvelutSelection={this.state.palvelutSelection}
                    palvelutSelectAction={this._onPalvelutSelection}
                    palveluKayttooikeusSelectAction={this._onPalveluKayttooikeusSelection}
                    palveluKayttooikeusSelection={this.state.palveluKayttooikeusSelection}
                    lisaaPalveluJaKayttooikeusAction={this._onLisaaPalveluJaKayttooikeus}
                    palveluJaKayttooikeusSelections={this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections}
                    removePalveluJaKayttooikeus={this._onRemovePalveluJaKayttooikeus}
                />

                <div className="kayttooikeusryhmat-lisaa-page-buttons">
                    <button
                        disabled={!this._validateKayttooikeusryhmaInputs()}
                        className="oph-button oph-button-primary"
                        onClick={() => {
                            return this.props.kayttooikeusryhmaId
                                ? this.updateKayttooikeusryhma()
                                : this.createNewKayttooikeusryhma();
                        }}
                    >
                        <SpinnerInButton show={this.state.toggleTallenna}></SpinnerInButton> {this.props.L['TALLENNA']}
                    </button>
                    <button
                        className="oph-button oph-button-cancel"
                        onClick={() => {
                            this.cancel();
                        }}
                    >
                        {this.props.L['PERUUTA']}
                    </button>
                    <ToggleKayttooikeusryhmaStateModal
                        router={this.props.router}
                        kayttooikeusryhmaId={this.props.kayttooikeusryhmaId}
                    />
                    <span>
                        {this.props.L['MUOKATTU']}: {this.renderKayttooikeusryhmaMuokattu()}
                    </span>
                </div>

                <LocalNotification
                    toggle={!this._validateKayttooikeusryhmaInputs()}
                    type={'info'}
                    title={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVA_TIETO_OTSIKKO']}
                >
                    <ul>
                        {this._validateKayttooikeusryhmaNimet() ? null : (
                            <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_NIMI']}</li>
                        )}
                        {this._validateKayttooikeusryhmaDescriptions() ? null : (
                            <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_KUVAUS']}</li>
                        )}
                        {this._validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections() ? null : (
                            <li>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_PALVELUKAYTTOOIKEUS']}</li>
                        )}
                    </ul>
                </LocalNotification>

                <LocalNotification
                    toggle={this._hasPassiveOrganisaatioRajoite.call(this)}
                    type={NOTIFICATIONTYPES.WARNING}
                    title={this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU_VAROITUS']}
                />
            </div>
        );
    }

    _parseExistingKayttooikeusryhmaData = (kayttooikeusryhmaState: KayttooikeusRyhmaState): KayttooikeusryhmaForm => {
        const organisaatioviiteData = kayttooikeusryhmaState.kayttooikeusryhma?.organisaatioViite;
        return {
            name: this._parseExistingTextsData(kayttooikeusryhmaState.kayttooikeusryhma?.nimi?.texts),
            description: this._parseExistingTextsData(kayttooikeusryhmaState.kayttooikeusryhma?.kuvaus?.texts),
            organisaatioSelections: organisaatioviiteData
                ? this._parseExistingOrganisaatioData(organisaatioviiteData, this.props.organisaatioCache)
                : [],
            oppilaitostyypitSelections: organisaatioviiteData
                ? this._parseExistingOppilaitostyyppiData(organisaatioviiteData)
                : [],
            organisaatiotyypitSelections: organisaatioviiteData
                ? this._parseExistingOrganisaatiotyyppiData(organisaatioviiteData)
                : [],
            ryhmaRestriction: this._parseExistingRyhmaRestriction(kayttooikeusryhmaState),
            kayttooikeusryhmaSelections: this._parseExistingKayttooikeusryhmaSelections(
                kayttooikeusryhmaState.kayttooikeusryhmaSlaves
            ),
            palveluJaKayttooikeusSelections: this._parseExistingPalvelutRoolitData(
                kayttooikeusryhmaState.palvelutRoolit
            ),
            sallittuKayttajatyyppi: kayttooikeusryhmaState.kayttooikeusryhma?.sallittuKayttajatyyppi,
        };
    };

    _parseExistingRyhmaRestriction = (kayttooikeusryhmaState: KayttooikeusRyhmaState) => {
        const organisaatioViitteet = kayttooikeusryhmaState.kayttooikeusryhma?.organisaatioViite || [];
        const organisaatioViiteRyhmaRestriction: boolean =
            organisaatioViitteet.length > 0
                ? organisaatioViitteet.some((organisaatioviite) =>
                      this._isRyhmaOid(organisaatioviite.organisaatioTyyppi)
                  )
                : false;
        const ryhmaRestriction = kayttooikeusryhmaState.kayttooikeusryhma?.ryhmaRestriction;
        return organisaatioViiteRyhmaRestriction || ryhmaRestriction;
    };

    _parseExistingKayttooikeusryhmaSelections = (slaves: Kayttooikeusryhma[]): SelectOption[] => {
        return slaves.map((slave) => {
            const text = slave.nimi.texts?.find((text) => text.lang.toLowerCase() === this.props.locale);
            return {
                value: slave.id.toString(),
                label: text.text,
            };
        });
    };

    _parseExistingTextsData = (texts: Text[]) => {
        const result = { FI: '', SV: '', EN: '' };
        if (texts === undefined) {
            return result;
        }
        texts.forEach((text: Text) => {
            result[text.lang] = text.text;
        });
        return result;
    };

    _parseExistingOrganisaatioData = (
        organisaatioViitteet: OrganisaatioViite[],
        organisaatioCache: OrganisaatioCache
    ): Array<OrganisaatioSelectObject> => {
        if (Object.keys(organisaatioCache).length === 0 || !organisaatioViitteet) {
            return [];
        }
        const organisaatioViittees = organisaatioViitteet.filter((organisaatioViite) =>
            this._isOrganisaatioOid(organisaatioViite.organisaatioTyyppi)
        );
        const organisaatioOids = organisaatioViittees.map((organisaatioViite) => organisaatioViite.organisaatioTyyppi);
        return organisaatioOids
            .map((oid) => organisaatioCache[oid])
            .filter(Boolean) // might be undefined (at least in dev environments)
            .map((organisaatio) => {
                const localizedName = getLocalization(organisaatio.nimi, this.props.locale);
                const name =
                    organisaatio.status === 'AKTIIVINEN'
                        ? localizedName
                        : `${localizedName} (${this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})`;
                return {
                    oid: organisaatio.oid,
                    name,
                    parentNames: [],
                    organisaatioTyypit: [],
                    organisaatiotyypit: undefined,
                    oidPath: undefined,
                    status: undefined,
                };
            });
    };

    _isOrganisaatioOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] === '10';
    };

    _isOppilaitosId = (input: string): boolean => {
        return input.startsWith('oppilaitostyyppi_');
    };

    _isOrganisaatiotyyppi = (input: string): boolean => {
        return input.startsWith('organisaatiotyyppi_');
    };

    _isRyhmaOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] !== '10';
    };

    _parseExistingOppilaitostyyppiData = (organisaatioViitteet: OrganisaatioViite[]): Array<string> => {
        const oppilaitostyypit: Array<string> = this.props.koodisto.oppilaitostyypit.map(
            (oppilaitostyyppiKoodi) => oppilaitostyyppiKoodi.koodiUri
        );
        const oppilaitosOrganisaatioViiteet = organisaatioViitteet.filter((organisaatioViite) =>
            this._isOppilaitosId(organisaatioViite.organisaatioTyyppi)
        );
        const ids = oppilaitosOrganisaatioViiteet.map((item) => item.organisaatioTyyppi);
        return oppilaitostyypit.filter((oppilaitostyyppi) => ids.includes(oppilaitostyyppi));
    };

    _parseExistingOrganisaatiotyyppiData = (organisaatioViitteet: OrganisaatioViite[]): Array<string> => {
        const organisaatiotyypit: Array<string> = this.props.koodisto.organisaatiotyyppiKoodisto.map(
            (organisaatiotyyppiKoodi) => organisaatiotyyppiKoodi.koodiUri
        );
        const organisaatiotyyppiOrganisaatioViiteet = organisaatioViitteet.filter((organisaatioViite) =>
            this._isOrganisaatiotyyppi(organisaatioViite.organisaatioTyyppi)
        );
        const ids = organisaatiotyyppiOrganisaatioViiteet.map((item) => item.organisaatioTyyppi);
        return organisaatiotyypit.filter((organisaatiotyyppi) => ids.includes(organisaatiotyyppi));
    };

    _parseExistingPalvelutRoolitData = (palvelutRoolit: Array<PalveluRooli>) => {
        return palvelutRoolit.map((palveluRooli) => {
            const matchLocale = (text: Text) => text.lang.toLowerCase() === this.props.locale;
            const palveluLabel = palveluRooli.palveluTexts?.find(matchLocale);
            const kayttooikeusLabel = palveluRooli.rooliTexts.find(matchLocale);
            return {
                palvelu: {
                    value: palveluRooli.palveluName,
                    label: palveluLabel.text,
                },
                kayttooikeus: {
                    value: palveluRooli.rooli,
                    label: kayttooikeusLabel.text,
                },
            };
        });
    };

    _toggleRyhmaRestriction = () => {
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                ryhmaRestriction: !this.state.kayttooikeusryhmaForm.ryhmaRestriction,
            },
        });
    };

    _toggleSallittuKayttajatyyppiPalvelu = () => {
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                sallittuKayttajatyyppi:
                    this.state.kayttooikeusryhmaForm.sallittuKayttajatyyppi === 'PALVELU' ? null : 'PALVELU',
            },
        });
    };

    _onOrganisaatioSelection = (selection: OrganisaatioSelectObject): void => {
        const currentOrganisaatioSelections: Array<OrganisaatioSelectObject> =
            this.state.kayttooikeusryhmaForm.organisaatioSelections;
        if (!currentOrganisaatioSelections.some((organisaatio) => organisaatio.oid === selection.oid)) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    organisaatioSelections: [...currentOrganisaatioSelections, selection],
                },
            });
        }
    };

    _onRemoveOrganisaatioSelect = (selection: OrganisaatioSelectObject): void => {
        const newOrganisaatioSelections: Array<OrganisaatioSelectObject> =
            this.state.kayttooikeusryhmaForm.organisaatioSelections.filter(
                (organisaatio) => selection.oid !== organisaatio.oid
            );
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                organisaatioSelections: newOrganisaatioSelections,
            },
        });
    };

    _onOppilaitostyypitSelection = (selection: React.ChangeEvent<HTMLInputElement>): void => {
        if (selection.target.checked) {
            const currentOppilaitostyypitSelections: Array<string> =
                this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections;
            if (
                !currentOppilaitostyypitSelections.some(
                    (oppilaitostyyppi: string) => oppilaitostyyppi === selection.target.value
                )
            ) {
                this.setState({
                    kayttooikeusryhmaForm: {
                        ...this.state.kayttooikeusryhmaForm,
                        oppilaitostyypitSelections: [...currentOppilaitostyypitSelections, selection.target.value],
                    },
                });
            }
        } else {
            const newOppilaitostyypitSelections: Array<string> =
                this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections.filter(
                    (oppilaitostyyppi: string) => selection.target.value !== oppilaitostyyppi
                );
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    oppilaitostyypitSelections: newOppilaitostyypitSelections,
                },
            });
        }
    };

    _onOrganisaatiotyypitSelection = (selection: React.ChangeEvent<HTMLInputElement>): void => {
        if (selection.target.checked) {
            const currentOrganisaatiotyypitSelections: Array<string> =
                this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections;
            if (
                !currentOrganisaatiotyypitSelections.some(
                    (organisaatiotyyppi: string) => organisaatiotyyppi === selection.target.value
                )
            ) {
                this.setState({
                    kayttooikeusryhmaForm: {
                        ...this.state.kayttooikeusryhmaForm,
                        organisaatiotyypitSelections: [...currentOrganisaatiotyypitSelections, selection.target.value],
                    },
                });
            }
        } else {
            const newOrganisaatiotyypitSelections: Array<string> =
                this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections.filter(
                    (organisaatiotyyppi: string) => selection.target.value !== organisaatiotyyppi
                );
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    organisaatiotyypitSelections: newOrganisaatiotyypitSelections,
                },
            });
        }
    };

    _setName = (languageCode: string, value: string): void => {
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                name: {
                    ...this.state.kayttooikeusryhmaForm.name,
                    [languageCode]: value,
                },
            },
        });
    };

    _setDescription = (languageCode: string, value: string): void => {
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                description: {
                    ...this.state.kayttooikeusryhmaForm.description,
                    [languageCode]: value,
                },
            },
        });
    };

    _onKayttooikeusryhmaSelection = (selection: SelectOption): void => {
        const currentKayttooikeusryhmaSelections = this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections;
        if (
            !currentKayttooikeusryhmaSelections.some((kayttooikeusryhma) => kayttooikeusryhma.value === selection.value)
        ) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    kayttooikeusryhmaSelections: [...currentKayttooikeusryhmaSelections, selection],
                },
            });
        }
    };

    _onRemoveKayttooikeusryhmaSelect = (selection: SelectOption): void => {
        const newKayttooikeusryhmaSelections = this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections.filter(
            (kayttooikeusryhma) => kayttooikeusryhma.value !== selection.value
        );
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                kayttooikeusryhmaSelections: newKayttooikeusryhmaSelections,
            },
        });
    };

    _onPalvelutSelection = (selection: SelectOption): void => {
        this.setState({
            palvelutSelection: selection,
            palveluKayttooikeusSelection: undefined,
        });
    };

    _onPalveluKayttooikeusSelection = (selection: SelectOption): void => {
        this.setState({ palveluKayttooikeusSelection: selection });
    };

    _onLisaaPalveluJaKayttooikeus = (): void => {
        const { palvelutSelection, palveluKayttooikeusSelection } = this.state;
        const newKayttoikeusSelection: PalveluJaKayttooikeusSelection = {
            palvelu: palvelutSelection,
            kayttooikeus: palveluKayttooikeusSelection,
        };
        const currentKayttooikeusSelections = this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections;
        if (
            !currentKayttooikeusSelections.some(
                (kayttooikeusSelection: PalveluJaKayttooikeusSelection) =>
                    kayttooikeusSelection.palvelu.value === newKayttoikeusSelection.palvelu.value &&
                    kayttooikeusSelection.kayttooikeus.value === newKayttoikeusSelection.kayttooikeus.value
            )
        ) {
            this.setState({
                kayttooikeusryhmaForm: {
                    ...this.state.kayttooikeusryhmaForm,
                    palveluJaKayttooikeusSelections: [...currentKayttooikeusSelections, newKayttoikeusSelection],
                },
                palveluKayttooikeusSelection: undefined,
            });
        }
    };

    _onRemovePalveluJaKayttooikeus = (removeItem: PalveluJaKayttooikeusSelection): void => {
        const newPalveluJaKayttooikeusSelections =
            this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.filter(
                (currentItem: PalveluJaKayttooikeusSelection) =>
                    !(
                        removeItem.kayttooikeus.value === currentItem.kayttooikeus.value &&
                        removeItem.palvelu.value === currentItem.palvelu.value
                    )
            );
        this.setState({
            kayttooikeusryhmaForm: {
                ...this.state.kayttooikeusryhmaForm,
                palveluJaKayttooikeusSelections: newPalveluJaKayttooikeusSelections,
            },
        });
    };

    _validateKayttooikeusryhmaInputs = (): boolean => {
        return (
            this._validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections() &&
            this._validateKayttooikeusryhmaDescriptions() &&
            this._validateKayttooikeusryhmaNimet()
        );
    };

    _validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections = (): boolean => {
        return this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.length > 0;
    };

    _validateKayttooikeusryhmaDescriptions = (): boolean => {
        const description = this.state.kayttooikeusryhmaForm.description;
        return description.FI.length > 0 && description.SV.length > 0;
    };

    _validateKayttooikeusryhmaNimet = (): boolean => {
        const name = this.state.kayttooikeusryhmaForm.name;
        return name.FI.length > 0 && name.SV.length > 0 && name.EN.length > 0;
    };

    _parseNameData = (): TextGroupModify => {
        const name = this.state.kayttooikeusryhmaForm.name;
        const texts: Text[] = Object.keys(name).map((key) => ({
            lang: key as Locales,
            text: name[key] as string,
        }));
        return { texts };
    };

    _parseDescriptionData = (): TextGroupModify => {
        const description = this.state.kayttooikeusryhmaForm.description;
        const texts: Text[] = Object.keys(description).map((key) => ({
            lang: key as Locales,
            text: description[key] as string,
        }));
        return { texts };
    };

    _parsePalvelutRoolit = (): Array<PalveluRooliModify> => {
        return this.state.kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.map(
            (item: PalveluJaKayttooikeusSelection) => ({
                palveluName: item.palvelu.value,
                rooli: item.kayttooikeus.value,
            })
        );
    };

    _parseSlaveIds = (): number[] => {
        return this.state.kayttooikeusryhmaForm.kayttooikeusryhmaSelections.map((selection) =>
            parseInt(selection.value, 10)
        );
    };

    _parseOrganisaatioTyypit = (): Array<string> => {
        const oppilaitostyypit = this.state.kayttooikeusryhmaForm.oppilaitostyypitSelections;
        const organisaatiotyypit = this.state.kayttooikeusryhmaForm.organisaatiotyypitSelections;
        const tyypit = oppilaitostyypit.concat(organisaatiotyypit);
        const organisaatiot = this.state.kayttooikeusryhmaForm.organisaatioSelections.map(
            (item: OrganisaatioSelectObject) => item.oid
        );
        const ryhmaRestrictionviite = this.state.ryhmaRestrictionViite
            ? [this.state.ryhmaRestrictionViite.organisaatioTyyppi]
            : [];
        return this.state.ryhmaRestrictionViite
            ? tyypit.concat(organisaatiot).concat(ryhmaRestrictionviite)
            : tyypit.concat(organisaatiot);
    };

    _hasPassiveOrganisaatioRajoite = (): boolean => {
        const passivoitu = this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU'];
        const organisaatioSelections = this.state.kayttooikeusryhmaForm.organisaatioSelections;
        return (
            organisaatioSelections &&
            organisaatioSelections.some((selection: OrganisaatioSelectObject) => selection.name.includes(passivoitu))
        );
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
            this.setState({ toggleTallenna: true });
            await http.post(url, this.parsePayload());
            this.setState({ toggleTallenna: false }, () => {
                this.props.router.push('/kayttooikeusryhmat');
            });
        } catch (error) {
            this.props.addGlobalNotification({
                key: 'UUDENKAYTTOIKEUSRYHMANLUONTIVIRHE',
                title: this.props.L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            });
            throw error;
        }
    }

    async updateKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id', this.props.kayttooikeusryhmaId);
        try {
            this.setState({ toggleTallenna: true });
            await http.put(url, this.parsePayload());
            this.setState({ toggleTallenna: false }, () => {
                this.props.router.push('/kayttooikeusryhmat');
            });
        } catch (error) {
            this.props.addGlobalNotification({
                key: 'KAYTTOOIKEUSRYHMANPAIVITYSVIRHE',
                title: this.props.L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            });
            throw error;
        }
    }

    getStatusString() {
        return this.state.isPassivoitu ? ` (${this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})` : '';
    }

    renderKayttooikeusryhmaMuokattu() {
        const kayttooikeusryhma = this.props.kayttooikeus.kayttooikeusryhma;
        if (kayttooikeusryhma) {
            const muokattu = kayttooikeusryhma.muokattu
                ? moment(kayttooikeusryhma.muokattu).format(PropertySingleton.state.PVM_DATE_TIME_FORMAATTI)
                : null;
            const muokkaaja = kayttooikeusryhma.muokkaaja ? kayttooikeusryhma.muokkaaja : null;
            if (muokattu && muokkaaja) {
                return `${muokattu} (${muokkaaja})`;
            }
            return this.props.L['EI_TIEDOSSA'];
        }
        return '';
    }
}
