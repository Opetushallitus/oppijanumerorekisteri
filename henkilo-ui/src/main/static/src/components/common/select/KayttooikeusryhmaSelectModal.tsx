import React, { useState } from 'react';

import KayttooikeusryhmaSelect from '../select/KayttooikeusryhmaSelect';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { SallitutKayttajatyypit } from '../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import OphModal from '../modal/OphModal';
import { useLocalisations } from '../../../selectors';
import { OphDsBanner } from '../../design-system/OphDsBanner';
import { OphDsButton } from '../../design-system/OphDsButton';

type Props = {
    kayttooikeusryhmat: Kayttooikeusryhma[];
    kayttooikeusryhmaValittu: boolean;
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void;
    disabled?: boolean;
    loading: boolean;
    isOrganisaatioSelected: boolean;
    sallittuKayttajatyyppi: SallitutKayttajatyypit;
};

const KayttooikeusryhmaSelectModal = (props: Props) => {
    const [visible, setVisible] = useState(false);
    const { L } = useLocalisations();

    const isValid =
        props.loading ||
        !props.isOrganisaatioSelected ||
        !!props.kayttooikeusryhmat.length ||
        props.kayttooikeusryhmaValittu;

    return (
        <>
            <div>
                <OphDsButton
                    dataTestid="valitseKayttooikeusOpenModal"
                    disabled={props.disabled || !isValid}
                    isLoading={props.loading}
                    onClick={() => setVisible(true)}
                >
                    {L('OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA')}
                </OphDsButton>
            </div>
            {!isValid && (
                <div style={{ marginTop: '1rem' }}>
                    <OphDsBanner type="error">{L('KAYTTOOIKEUSRYHMA_VALINTA_EI_SALLITTUJA')}</OphDsBanner>
                </div>
            )}
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
