import React from 'react';

import type { HenkiloCreate } from '../../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import type { HenkiloDuplicate } from '../../../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import HenkiloViewDuplikaatit from '../../../../../components/henkilo/duplikaatit/HenkiloViewDuplikaatit';
import { useLocalisations } from '../../../../../selectors';

type Props = {
    tallenna: (oppija: HenkiloCreate) => void;
    peruuta: () => void;
    oppija: HenkiloCreate;
    duplikaatit: HenkiloDuplicate[];
};

/**
 * Oppijoiden luonnissa näytettävät duplikaattihenkilöt.
 */
const OppijaCreateDuplikaatit = (props: Props) => {
    const { L } = useLocalisations();

    const tallenna = () => {
        props.tallenna(props.oppija);
    };

    const peruuta = () => {
        props.peruuta();
    };

    return (
        <div>
            <div className="oph-field">{L('OPPIJAN_LUONTI_DUPLIKAATIT_OHJE')}</div>
            <HenkiloViewDuplikaatit
                henkilo={{ ...props.oppija }}
                vainLuku={true}
                henkiloType="oppija"
                duplicates={props.duplikaatit}
            />
            <div className="oph-field">
                <button type="button" className="oph-button oph-button-primary" onClick={tallenna}>
                    {L('OPPIJAN_LUONTI_LUO_NAPPI')}
                </button>
                <button type="button" className="oph-button oph-button-cancel" onClick={peruuta}>
                    {L('PERUUTA')}
                </button>
            </div>
        </div>
    );
};

export default OppijaCreateDuplikaatit;
