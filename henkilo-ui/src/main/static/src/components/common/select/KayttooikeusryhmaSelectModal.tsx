import React, { useState } from 'react';

import KayttooikeusryhmaSelect from '../select/KayttooikeusryhmaSelect';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { SallitutKayttajatyypit } from '../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import OphModal from '../modal/OphModal';
import { SpinnerInButton } from '../icons/SpinnerInButton';
import { useLocalisations } from '../../../selectors';
import { OphDsBanner } from '../../design-system/OphDsBanner';

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
                <button
                    data-testid="valitseKayttooikeusOpenModal"
                    className="oph-ds-button"
                    disabled={props.disabled || !!props.loading || !isValid}
                    onClick={() => setVisible(true)}
                >
                    <SpinnerInButton show={!!props.loading} /> {L('OMATTIEDOT_VALITSE_KAYTTOOIKEUSRYHMA')}
                </button>
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
