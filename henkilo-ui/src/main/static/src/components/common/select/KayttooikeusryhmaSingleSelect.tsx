import React from "react"
import {connect} from "react-redux"
import OphSelect from "./OphSelect"
import StaticUtils from "../StaticUtils"
import {fetchAllKayttooikeusryhma} from "../../../actions/kayttooikeusryhma.actions"
import {Localisations} from "../../../types/localisation.type"
import {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types"

type OwnProps = {
    kayttooikeusSelectionAction: (arg0: number) => void
    kayttooikeusSelection: number | null | undefined
}

type Props = OwnProps & {
    L: Localisations
    locale: string
    fetchAllKayttooikeusryhma: (arg0: boolean) => void
    kayttooikeusRyhmas: Array<Kayttooikeusryhma>
    kayttooikeusLoading: boolean
}

type State = {
    selectedKayttooikeus: number | null | undefined
}

class KayttooikeusryhmaSingleSelect extends React.Component<Props, State> {
    componentDidMount() {
        // Fetches only if not already fetched
        this.props.fetchAllKayttooikeusryhma(false)
    }

    constructor(props: Props) {
        super(props)

        this.state = {
            selectedKayttooikeus: null,
        }
    }

    render() {
        return !this.props.kayttooikeusLoading &&
            this.props.kayttooikeusRyhmas &&
            this.props.kayttooikeusRyhmas.length ? (
            <OphSelect
                id="kayttooikeusryhmaFilter"
                options={this.props.kayttooikeusRyhmas
                    .filter(kayttooikeusryhma => !kayttooikeusryhma.passivoitu)
                    .map(kayttooikeusryhma => ({
                        value: kayttooikeusryhma.id,
                        label: StaticUtils.getLocalisedText(
                            kayttooikeusryhma.description,
                            this.props.locale,
                        ),
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))}
                value={this.props.kayttooikeusSelection}
                placeholder={
                    this.props.L[
                        "HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER"
                    ]
                }
                onChange={event =>
                    this.props.kayttooikeusSelectionAction(event.value)
                }
            />
        ) : null
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    kayttooikeusLoading: state.kayttooikeus.allKayttooikeusryhmasLoading,
    kayttooikeusRyhmas: state.kayttooikeus.allKayttooikeusryhmas,
})

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    fetchAllKayttooikeusryhma,
})(KayttooikeusryhmaSingleSelect)