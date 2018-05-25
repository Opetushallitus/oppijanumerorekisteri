// @flow
import React from 'react'
import type {Locale} from '../../../types/locale.type'
import KayttooikeusryhmaSelect from '../select/KayttooikeusryhmaSelect'
import type {Kayttooikeusryhma} from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types'
import type {L} from "../../../types/localisation.type";
import SelectModal from "../modal/SelectModal";

type Props = {
    locale: Locale,
    L: L,
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
        super(props);

        this.state = {visible: false}
    }

    render() {
        return (
            <SelectModal disabled={this.props.disabled}
                         buttonText={this.props.L['OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA']}>
                <KayttooikeusryhmaSelect
                    locale={this.props.locale}
                    L={this.props.L}
                    kayttooikeusryhmat={this.props.kayttooikeusryhmat}
                    onSelect={this.props.onSelect}
                />
            </SelectModal>
        )
    }
}

export default KayttooikeusryhmaSelectModal
