import React from "react"
import {connect} from "react-redux"
import "./HenkiloViewCreateKayttooikeusanomus.css"
import OphSelect from "../select/OphSelect"
import Button from "../button/Button"
import * as R from "ramda"
import IconButton from "../button/IconButton"
import CrossCircleIcon from "../icons/CrossCircleIcon"
import EmailSelect from "./select/EmailSelect"
import WideBlueNotification from "../../common/notifications/WideBlueNotification"
import KayttooikeusryhmaSelectModal from "../select/KayttooikeusryhmaSelectModal"
import Loader from "../icons/Loader"
import {
    createKayttooikeusanomus,
    fetchOrganisaatioKayttooikeusryhmat,
} from "../../../actions/kayttooikeusryhma.actions"
import {addGlobalNotification} from "../../../actions/notification.actions"
import {OrganisaatioSelectModal} from "../select/OrganisaatioSelectModal"
import {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types"
import {organisaatioToOrganisaatioSelectObject} from "../../../utilities/organisaatio.util"
import {LocalNotification} from "../Notification/LocalNotification"
import {L10n} from "../../../types/localisation.type"
import {Locale} from "../../../types/locale.type"
import {OmattiedotState} from "../../../reducers/omattiedot.reducer"
import {OrganisaatioState} from "../../../reducers/organisaatio.reducer"
import {RyhmatState} from "../../../reducers/ryhmat.reducer"
import {HenkiloState} from "../../../reducers/henkilo.reducer"
import {NOTIFICATIONTYPES} from "../Notification/notificationtypes"
import {GlobalNotificationConfig} from "../../../types/notification.types"
import {OrganisaatioKayttooikeusryhmatState} from "../../../reducers/organisaatiokayttooikeusryhmat.reducer"

type Props = {
    l10n: L10n
    locale: Locale
    omattiedot: OmattiedotState
    organisaatios: OrganisaatioState
    ryhmas?: RyhmatState
    henkilo: HenkiloState
    ryhmaOptions: Array<{label: string; value: string}>
    kayttooikeusryhmat: Array<any>
    fetchOrganisaatioKayttooikeusryhmat: (arg0: string) => void
    organisaatioKayttooikeusryhmat: OrganisaatioKayttooikeusryhmatState
    createKayttooikeusanomus: (arg0: any) => void
    fetchAllKayttooikeusAnomusForHenkilo: (arg0: string) => void
    addGlobalNotification: (arg0: GlobalNotificationConfig) => any
}

type State = {
    organisaatioSelection: string
    organisaatioSelectionName: string
    ryhmaSelection: string
    kayttooikeusryhmaSelections: Array<any>
    perustelut: string
    emailOptions: {
        emailSelection?: any
        missingEmail: boolean
        showMissingEmailNotification: boolean
        options?: any
    }
}

class HenkiloViewCreateKayttooikeusanomus extends React.Component<
    Props,
    State
> {
    constructor(props: Props) {
        super(props)

        this.state = {
            organisaatioSelection: "",
            organisaatioSelectionName: "",
            ryhmaSelection: "",
            kayttooikeusryhmaSelections: [],
            perustelut: "",
            emailOptions: this.createEmailOptions(props.henkilo),
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            emailOptions: this.createEmailOptions(nextProps.henkilo),
        })
    }

    render() {
        const L = this.props.l10n[this.props.locale]
        const kayttooikeusryhmaSelections = this.state.kayttooikeusryhmaSelections.map(
            selection => {
                return {id: selection.value}
            },
        )
        const kayttooikeusryhmat = this.props.kayttooikeusryhmat.filter(
            kayttooikeusryhma =>
                R.findIndex(
                    R.propEq("id", kayttooikeusryhma.id),
                    kayttooikeusryhmaSelections,
                ) < 0,
        )

        return this.props.henkilo.henkiloLoading ? (
            <Loader />
        ) : (
            <div className="kayttooikeus-anomus-wrapper">
                <div className="header">
                    <span className="oph-h2 oph-bold">
                        {L["OMATTIEDOT_OTSIKKO"]}
                    </span>
                </div>
                {this.state.emailOptions.showMissingEmailNotification ? (
                    <WideBlueNotification
                        message={
                            L["OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_UUSI_ANOMUS"]
                        }
                        closeAction={() => {
                            this.setState({
                                ...this.state,
                                emailOptions: {
                                    ...this.state.emailOptions,
                                    showMissingEmailNotification: false,
                                },
                            })
                        }}
                    />
                ) : null}

                <div>
                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label oph-bold oph-label-long"
                            aria-describedby="field-text"
                        >
                            {L["OMATTIEDOT_ORGANISAATIO_TAI_RYHMA"]}*
                        </label>

                        <div className="oph-input-container flex-horizontal">
                            <input
                                className="oph-input flex-item-1 kutsutut-organisaatiosuodatus"
                                type="text"
                                value={this.state.organisaatioSelectionName}
                                placeholder={
                                    L["OMATTIEDOT_VALITSE_ORGANISAATIO"]
                                }
                                readOnly
                            />
                            <OrganisaatioSelectModal
                                locale={this.props.locale}
                                L={L}
                                organisaatiot={this._parseOrganisaatioSelectOptions.call(
                                    this,
                                    this.props.organisaatios,
                                )}
                                onSelect={this._changeOrganisaatioSelection.bind(
                                    this,
                                )}
                                disabled={
                                    this.props.organisaatios
                                        .organisaatioHierarkiaLoading
                                }
                            />
                        </div>
                    </div>

                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label otph-bold oph-label-long"
                            aria-describedby="field-text"
                        />
                        <div className="oph-input-container">
                            <OphSelect
                                onChange={this._changeRyhmaSelection.bind(this)}
                                options={this.props.ryhmaOptions.sort((a, b) =>
                                    a.label.localeCompare(b.label),
                                )}
                                value={this.state.ryhmaSelection}
                                placeholder={L["OMATTIEDOT_ANOMINEN_RYHMA"]}
                                disabled={this.state.emailOptions.missingEmail}
                            />
                        </div>
                    </div>

                    {this.state.emailOptions.options &&
                    this.state.emailOptions.options.length > 1 ? (
                        <div className="oph-field oph-field-inline">
                            <label
                                className="oph-label oph-bold oph-label-long"
                                htmlFor="email"
                                aria-describedby="field-text"
                            >
                                {L["OMATTIEDOT_SAHKOPOSTIOSOITE"]}*
                            </label>

                            <EmailSelect
                                changeEmailAction={this._changeEmail.bind(this)}
                                emailSelection={
                                    this.state.emailOptions.emailSelection
                                }
                                emailOptions={this.state.emailOptions.options}
                            />
                        </div>
                    ) : null}

                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label oph-bold oph-label-long"
                            aria-describedby="field-text"
                        >
                            {L["OMATTIEDOT_ANOTTAVAT"]}*
                        </label>

                        <div className="oph-input-container kayttooikeus-selection-wrapper">
                            <KayttooikeusryhmaSelectModal
                                locale={this.props.locale}
                                L={L}
                                kayttooikeusryhmat={kayttooikeusryhmat}
                                kayttooikeusryhmaValittu={
                                    this.state.kayttooikeusryhmaSelections
                                        .length > 0
                                }
                                onSelect={this._addKayttooikeusryhmaSelection.bind(
                                    this,
                                )}
                                disabled={this.state.emailOptions.missingEmail}
                                loading={
                                    this.props.organisaatioKayttooikeusryhmat
                                        .kayttooikeusryhmatLoading
                                }
                                isOrganisaatioSelected={
                                    !!this.state.organisaatioSelection ||
                                    !!this.state.ryhmaSelection
                                }
                                sallittuKayttajatyyppi="VIRKAILIJA"
                            />
                        </div>
                    </div>

                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label oph-bold oph-label-long"
                            aria-describedby="field-text"
                        ></label>
                        <div className="oph-input-container">
                            <ul className="selected-permissions">
                                {this.state.kayttooikeusryhmaSelections.map(
                                    (kayttooikeusRyhmaSelection, index) => {
                                        return (
                                            <li key={index}>
                                                <div className="selected-permissions-name">
                                                    {
                                                        kayttooikeusRyhmaSelection.label
                                                    }
                                                    <IconButton
                                                        onClick={this._removeKayttooikeusryhmaSelection.bind(
                                                            this,
                                                            kayttooikeusRyhmaSelection,
                                                        )}
                                                    >
                                                        <CrossCircleIcon />
                                                    </IconButton>
                                                </div>
                                                {kayttooikeusRyhmaSelection.description && (
                                                    <div className="selected-permissions-description">
                                                        {
                                                            kayttooikeusRyhmaSelection.description
                                                        }
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    },
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label oph-bold oph-label-long"
                            htmlFor="perustelut"
                            aria-describedby="field-text"
                        >
                            {L["OMATTIEDOT_PERUSTELUT"]}
                        </label>

                        <div className="oph-input-container">
                            <textarea
                                className="oph-input"
                                value={this.state.perustelut}
                                onChange={this._changePerustelut.bind(this)}
                                name="perustelut"
                                id="perustelut"
                                cols="30"
                                rows="10"
                                placeholder={L["OMATTIEDOT_PERUSTELU_VIRHE"]}
                                disabled={this.state.emailOptions.missingEmail}
                            />
                        </div>
                    </div>

                    <div className="oph-field oph-field-inline">
                        <label
                            className="oph-label otph-bold oph-label-long"
                            aria-describedby="field-text"
                        />
                        <div className="oph-input-container">
                            <div className="anomus-button">
                                <Button
                                    action={this._createKayttooikeusAnomus.bind(
                                        this,
                                    )}
                                    disabled={!this.validAnomusForm()}
                                >
                                    {L["OMATTIEDOT_HAE_BUTTON"]}
                                </Button>
                            </div>

                            <div className="anomus-form-errors flex-horizontal">
                                <div className="flex-item-1">
                                    <LocalNotification
                                        title={L["OMATTIEDOT_ANOMINEN_VIRHEET"]}
                                        toggle={!this.validAnomusForm()}
                                        type={NOTIFICATIONTYPES.WARNING}
                                    >
                                        <ul>
                                            {!this._validOrganisaatioOrRyhmaSelection() ? (
                                                <li>
                                                    {
                                                        L[
                                                            "OMATTIEDOT_VAATIMUS_ORGANISAATIO"
                                                        ]
                                                    }
                                                </li>
                                            ) : null}
                                            {!this._validKayttooikeusryhmaSelection() ? (
                                                <li>
                                                    {
                                                        L[
                                                            "OMATTIEDOT_VAATIMUS_KAYTTOOIKEUDET"
                                                        ]
                                                    }
                                                </li>
                                            ) : null}
                                            {!this._validEmailSelection() ? (
                                                <li>
                                                    {
                                                        L[
                                                            "OMATTIEDOT_VAATIMUS_EMAIL"
                                                        ]
                                                    }
                                                </li>
                                            ) : null}
                                            {!this.validPerustelu() ? (
                                                <li>
                                                    {
                                                        L[
                                                            "OMATTIEDOT_PERUSTELU_VIRHE"
                                                        ]
                                                    }
                                                </li>
                                            ) : null}
                                        </ul>
                                    </LocalNotification>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    createEmailOptions(henkilo: HenkiloState) {
        const emailOptions = this._parseEmailOptions(henkilo)
        if (emailOptions.length === 1) {
            return {
                emailSelection: emailOptions[0].value,
                missingEmail: false,
                showMissingEmailNotification: false,
            }
        } else if (emailOptions.length > 1) {
            return {
                missingEmail: false,
                showMissingEmailNotification: false,
                emailSelection: "",
                options: emailOptions,
            }
        }
        return {missingEmail: true, showMissingEmailNotification: true}
    }

    _changeEmail(value: string) {
        this.setState({
            emailOptions: {
                ...this.state.emailOptions,
                emailSelection: value,
            },
        })
    }

    _changePerustelut(event: any) {
        this.setState({perustelut: event.target.value})
    }

    _changeOrganisaatioSelection(organisaatio: OrganisaatioSelectObject) {
        this.setState({
            organisaatioSelection: organisaatio.oid,
            ryhmaSelection: "",
            kayttooikeusryhmaSelections: [],
            organisaatioSelectionName: organisaatio.name,
        })
        this.props.fetchOrganisaatioKayttooikeusryhmat(organisaatio.oid)
    }

    _changeRyhmaSelection(selection: {label: string; value: string}) {
        this.setState({
            ryhmaSelection: selection.value,
            organisaatioSelection: "",
            kayttooikeusryhmaSelections: [],
            organisaatioSelectionName: "",
        })
        this.props.fetchOrganisaatioKayttooikeusryhmat(selection.value)
    }

    validAnomusForm() {
        return (
            this._validOrganisaatioOrRyhmaSelection() &&
            this._validKayttooikeusryhmaSelection() &&
            this._validEmailSelection() &&
            this.validPerustelu()
        )
    }

    _validOrganisaatioOrRyhmaSelection() {
        return (
            this.state.organisaatioSelection !== "" ||
            this.state.ryhmaSelection !== ""
        )
    }

    _validKayttooikeusryhmaSelection() {
        return this.state.kayttooikeusryhmaSelections.length > 0
    }

    _validEmailSelection() {
        return (
            this.state.emailOptions &&
            this.state.emailOptions.emailSelection !== "" &&
            !this.state.emailOptions.missingEmail
        )
    }

    validPerustelu() {
        return (
            this.state.perustelut === undefined ||
            this.state.perustelut.length <= 255
        )
    }

    _parseOrganisaatioSelectOptions(organisaatioState: OrganisaatioState) {
        return !organisaatioState.organisaatioHierarkiaLoading &&
            organisaatioState.organisaatioHierarkia
            ? organisaatioToOrganisaatioSelectObject(
                  organisaatioState.organisaatioHierarkia,
                  this.props.locale,
              )
            : []
    }

    _resetAnomusFormFields() {
        this.setState({
            organisaatioSelection: "",
            organisaatioSelectionName: "",
            ryhmaSelection: "",
            kayttooikeusryhmaSelections: [],
            perustelut: "",
            emailOptions: this.createEmailOptions(this.props.henkilo),
        })
    }

    _parseEmailOptions(
        henkilo: HenkiloState,
    ): Array<{value: string; label: string}> {
        let emails = []
        if (henkilo.henkilo.yhteystiedotRyhma) {
            henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
                yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                    if (yhteys.yhteystietoTyyppi === "YHTEYSTIETO_SAHKOPOSTI") {
                        emails.push(yhteys.yhteystietoArvo)
                    }
                })
            })
        }
        return emails.map(email => ({value: email || "", label: email || ""}))
    }

    _addKayttooikeusryhmaSelection(kayttooikeusryhma: any) {
        const locale = this.props.locale.toUpperCase()
        const kayttooikeusryhmaSelection = {
            value: kayttooikeusryhma.id,
            label: R.path(
                ["text"],
                R.find(R.propEq("lang", locale))(kayttooikeusryhma.nimi.texts),
            ),
            description: R.path(
                ["text"],
                R.find(R.propEq("lang", locale))(
                    kayttooikeusryhma.kuvaus
                        ? kayttooikeusryhma.kuvaus.texts
                        : [],
                ),
            ),
        }

        const kayttooikeusryhmaSelections = this.state
            .kayttooikeusryhmaSelections
        kayttooikeusryhmaSelections.push(kayttooikeusryhmaSelection)
        this.setState({
            kayttooikeusryhmaSelections: kayttooikeusryhmaSelections,
        })
    }

    _removeKayttooikeusryhmaSelection(kayttooikeusryhmaSelection: any) {
        const kayttooikeusryhmaSelections = this.state.kayttooikeusryhmaSelections.filter(
            selection => selection.value !== kayttooikeusryhmaSelection.value,
        )
        this.setState({kayttooikeusryhmaSelections})
    }

    async _createKayttooikeusAnomus() {
        const kayttooikeusRyhmaIds = R.map(
            selection => R.view(R.lensProp("value"), selection),
            this.state.kayttooikeusryhmaSelections,
        )
        const anomusData = {
            organisaatioOrRyhmaOid:
                this.state.organisaatioSelection || this.state.ryhmaSelection,
            email: this.state.emailOptions.emailSelection,
            perustelut: this.state.perustelut,
            kayttooikeusRyhmaIds,
            anojaOid: this.props.omattiedot.data.oid,
        }
        try {
            await this.props.createKayttooikeusanomus(anomusData)
        } catch (error) {
            this.props.addGlobalNotification({
                key: "OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS",
                type: NOTIFICATIONTYPES.ERROR,
                title: this.props.l10n[this.props.locale][
                    "OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS"
                ],
                autoClose: 10000,
            })
            throw error
        }
        this._resetAnomusFormFields()
        this.props.fetchAllKayttooikeusAnomusForHenkilo(
            this.props.omattiedot.data.oid,
        )
    }
}

export default connect(() => ({}), {
    fetchOrganisaatioKayttooikeusryhmat,
    createKayttooikeusanomus,
    addGlobalNotification,
})(HenkiloViewCreateKayttooikeusanomus)