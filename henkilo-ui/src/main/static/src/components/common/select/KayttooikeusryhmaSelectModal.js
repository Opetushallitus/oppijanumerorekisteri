// @flow
import React from 'react'
import type {Locale} from '../../../types/locale.type'
import KayttooikeusryhmaSelect from '../select/KayttooikeusryhmaSelect'
import type {Kayttooikeusryhma} from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types'
import type {Localisations} from "../../../types/localisation.type";
import SelectModal from "../modal/SelectModal";
import type {ValidationMessage} from "../../../types/validation.type";

type Props = {
    locale: Locale,
    L: Localisations,
    kayttooikeusryhmat: Array<Kayttooikeusryhma>,
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void,
    disabled?: boolean,
    loading: boolean,
    isOrganisaatioSelected: boolean,
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
        const isValid = !this.props.isOrganisaatioSelected || !!this.props.kayttooikeusryhmat.length;
        const validationMessage: ValidationMessage = {
            id: 'KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA',
            isValid,
            labelLocalised: this.props.L['KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA'],
        };

        return (
            <SelectModal disabled={!this.props.isOrganisaatioSelected || this.props.loading || !isValid || !!this.props.disabled}
                         loading={this.props.loading}
                         buttonText={this.props.L['OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA']}
                         validationMessages={{key: validationMessage}}>
                <KayttooikeusryhmaSelect
                    locale={this.props.locale}
                    L={this.props.L}
                    kayttooikeusryhmat={this.props.kayttooikeusryhmat}
                    onSelect={this.props.onSelect}
                />
            </SelectModal>
        );
    }
}

export default KayttooikeusryhmaSelectModal
