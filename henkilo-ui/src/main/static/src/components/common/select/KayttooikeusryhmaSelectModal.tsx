import React, { useState } from 'react';

import KayttooikeusryhmaSelect from '../select/KayttooikeusryhmaSelect';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { ValidationMessage } from '../../../types/validation.type';
import { SallitutKayttajatyypit } from '../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import OphModal from '../modal/OphModal';
import ValidationMessageButton from '../button/ValidationMessageButton';
import { SpinnerInButton } from '../icons/SpinnerInButton';
import { useLocalisations } from '../../../selectors';

type Props = {
    kayttooikeusryhmat: Kayttooikeusryhma[];
    kayttooikeusryhmaValittu: boolean;
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void;
    disabled?: boolean;
    loading: boolean;
    isOrganisaatioSelected: boolean;
    sallittuKayttajatyyppi: SallitutKayttajatyypit;
};

/**
 * Käyttöoikeusryhmän valintakomponentti modalissa.
 */
const KayttooikeusryhmaSelectModal = (props: Props) => {
    const [visible, setVisible] = useState(false);
    const { L } = useLocalisations();

    const isValid =
        !props.isOrganisaatioSelected || !!props.kayttooikeusryhmat.length || props.kayttooikeusryhmaValittu;
    const validationMessage: ValidationMessage = {
        id: 'KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA',
        isValid,
        labelLocalised: L['KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA'],
    };

    return (
        <>
            <ValidationMessageButton
                disabled={props.disabled || !!props.loading}
                validationMessages={{ key: validationMessage }}
                buttonAction={() => setVisible(true)}
            >
                <SpinnerInButton show={!!props.loading} /> {L['OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA']}
            </ValidationMessageButton>
            {visible && (
                <OphModal onClose={() => setVisible(false)} onOverlayClick={() => setVisible(false)}>
                    <KayttooikeusryhmaSelect
                        kayttooikeusryhmat={props.kayttooikeusryhmat}
                        onSelect={props.onSelect}
                        sallittuKayttajatyyppi={props.sallittuKayttajatyyppi}
                    />
                </OphModal>
            )}
        </>
    );
};

export default KayttooikeusryhmaSelectModal;
