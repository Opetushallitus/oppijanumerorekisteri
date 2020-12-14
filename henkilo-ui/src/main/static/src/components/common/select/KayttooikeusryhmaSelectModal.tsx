import React from "react"
import {Locale} from "../../../types/locale.type"
import KayttooikeusryhmaSelect from "../select/KayttooikeusryhmaSelect"
import {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types"
import {Localisations} from "../../../types/localisation.type"
import SelectModal from "../modal/SelectModal"
import {ValidationMessage} from "../../../types/validation.type"
import {SallitutKayttajatyypit} from "../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage"

type Props = {
    locale: Locale
    L: Localisations
    kayttooikeusryhmat: Array<Kayttooikeusryhma>
    kayttooikeusryhmaValittu: boolean
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void
    disabled?: boolean
    loading: boolean
    isOrganisaatioSelected: boolean
    sallittuKayttajatyyppi: SallitutKayttajatyypit
}

type State = {
    visible: boolean
}

/**
 * Käyttöoikeusryhmän valintakomponentti modalissa.
 */
class KayttooikeusryhmaSelectModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {visible: false}
    }

    render() {
        const isValid =
            !this.props.isOrganisaatioSelected ||
            !!this.props.kayttooikeusryhmat.length ||
            this.props.kayttooikeusryhmaValittu
        const validationMessage: ValidationMessage = {
            id: "KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA",
            isValid,
            labelLocalised: this.props.L[
                "KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA"
            ],
        }

        return (
            <SelectModal
                disabled={
                    !this.props.isOrganisaatioSelected ||
                    this.props.loading ||
                    !isValid ||
                    !!this.props.disabled
                }
                loading={this.props.loading}
                buttonText={
                    this.props.L["OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA"]
                }
                validationMessages={{key: validationMessage}}
            >
                <KayttooikeusryhmaSelect
                    locale={this.props.locale}
                    L={this.props.L}
                    kayttooikeusryhmat={this.props.kayttooikeusryhmat}
                    onSelect={this.props.onSelect}
                    sallittuKayttajatyyppi={this.props.sallittuKayttajatyyppi}
                />
            </SelectModal>
        )
    }
}

export default KayttooikeusryhmaSelectModal