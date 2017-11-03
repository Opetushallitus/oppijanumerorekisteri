// @flow
import React from 'react'
import type {Locale} from '../../../types/locale.type'
import OphModal from '../modal/OphModal'
import KayttooikeusryhmaSelect from '../select/KayttooikeusryhmaSelect'
import type {Kayttooikeusryhma} from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types'

type Props = {
    locale: Locale,
    L: any,
    kayttooikeusryhmat: Array<Kayttooikeusryhma>,
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void,
    disabled: boolean,
}

type State = {
    visible: boolean,
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
        return (
            <div>
                <button type="button"
                        className="oph-button oph-button-primary"
                        onClick={this.onOpen}
                        disabled={this.props.disabled}>
                    {this.props.L['OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA']}
                </button>
                {this.state.visible &&
                    <OphModal onClose={this.onClose}>
                        <KayttooikeusryhmaSelect
                            locale={this.props.locale}
                            L={this.props.L}
                            kayttooikeusryhmat={this.props.kayttooikeusryhmat}
                            onSelect={this.props.onSelect}
                            />
                    </OphModal>
                }
            </div>
        )
    }

    onOpen = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        this.setState({visible: true})
    }

    onClose = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        this.setState({visible: false})
    }

}

export default KayttooikeusryhmaSelectModal
