import React from "react"
import {connect} from "react-redux"
import AnomusPage from "./AnomusPage"
import {FetchHaetutKayttooikeusryhmatParameters} from "./AnomusPage"
import {
    clearHaetutKayttooikeusryhmat,
    fetchHaetutKayttooikeusryhmat,
} from "../../actions/anomus.actions"
import {
    fetchAllOrganisaatios,
    fetchAllRyhmas,
} from "../../actions/organisaatio.actions"
import {
    updateHaettuKayttooikeusryhmaInAnomukset,
    clearHaettuKayttooikeusryhma,
} from "../../actions/kayttooikeusryhma.actions"
import PropertySingleton from "../../globals/PropertySingleton"
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions"
import {addGlobalNotification} from "../../actions/notification.actions"
import {L10n} from "../../types/localisation.type"
import {Locale} from "../../types/locale.type"
import {OrganisaatioCache} from "../../reducers/organisaatio.reducer"
import {HaettuKayttooikeusryhma} from "../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types"
import {GlobalNotificationConfig} from "../../types/notification.types"
import {OrganisaatioCriteria} from "../../types/domain/organisaatio/organisaatio.types"

type OwnProps = {}

type Props = OwnProps & {
    l10n: L10n
    locale: Locale
    kayttooikeusAnomus: Array<HaettuKayttooikeusryhma>
    kayttooikeusAnomusLoading: boolean
    organisaatioCache: OrganisaatioCache
    haetutKayttooikeusryhmatLoading: boolean
    rootOrganisaatioOid: string
    isAdmin: boolean
    fetchHaetutKayttooikeusryhmat: (
        arg0: FetchHaetutKayttooikeusryhmatParameters,
    ) => void
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void
    fetchAllRyhmas: () => void
    updateHaettuKayttooikeusryhmaInAnomukset: (
        arg0: number,
        arg1: string,
        arg2: string,
        arg3: string,
        arg4: string | null | undefined,
    ) => Promise<any>
    clearHaettuKayttooikeusryhma: (arg0: number) => void
    clearHaetutKayttooikeusryhmat: () => void
    fetchOmattiedotOrganisaatios: () => void
    addGlobalNotification: (arg0: GlobalNotificationConfig) => void
}

class AnomusPageContainer extends React.Component<Props> {
    render() {
        const L = this.props.l10n[this.props.locale]
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">
                    {L["HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO"]}
                </span>
                <AnomusPage {...this.props} />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        kayttooikeusAnomus: state.haetutKayttooikeusryhmat.data,
        kayttooikeusAnomusLoading: state.haetutKayttooikeusryhmat.isLoading,
        organisaatioCache: state.organisaatio.cached,
        haetutKayttooikeusryhmatLoading:
            state.haetutKayttooikeusryhmat.isLoading,
        rootOrganisaatioOid: PropertySingleton.getState().rootOrganisaatioOid,
        isAdmin: state.omattiedot.isAdmin,
    }
}

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    fetchHaetutKayttooikeusryhmat,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    updateHaettuKayttooikeusryhmaInAnomukset,
    clearHaettuKayttooikeusryhma,
    clearHaetutKayttooikeusryhmat,
    fetchOmattiedotOrganisaatios,
    addGlobalNotification,
})(AnomusPageContainer)