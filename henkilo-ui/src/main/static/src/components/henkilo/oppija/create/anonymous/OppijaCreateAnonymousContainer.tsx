import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import OppijaCreateForm from './OppijaCreateForm';
import { HenkiloCreate } from '../../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import OppijaCreateDuplikaatit from './OppijaCreateDuplikaatit';
import CloseButton from '../../../../common/button/CloseButton';
import { useAppDispatch } from '../../../../../store';
import { useLocalisations } from '../../../../../selectors';
import { add } from '../../../../../slices/toastSlice';
import { useCreateOppijaMutation, useLazyGetDuplicatesQuery } from '../../../../../api/oppijanumerorekisteri';

type OwnProps = {
    goBack: () => void;
};

/**
 * Oppijan luonti -näkymä.
 */
export const OppijaCreateAnonymousContainer = ({ goBack }: OwnProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { L } = useLocalisations();
    const [oppija, setOppija] = useState<HenkiloCreate>();
    const [naytaDuplikaatit, setNaytaDuplikaatit] = useState(false);
    const [putOppija] = useCreateOppijaMutation();
    const [getDuplicates, { data: duplicates }] = useLazyGetDuplicatesQuery();

    const tallenna = async (oppija: HenkiloCreate) => {
        try {
            // tarkistetaan ennen luontia duplikaatit
            const duplikaatit = await getDuplicates({
                etunimet: oppija.etunimet,
                kutsumanimi: oppija.kutsumanimi,
                sukunimi: oppija.sukunimi,
                syntymaaika: oppija.syntymaaika,
            }).unwrap();
            if (duplikaatit.length > 0) {
                setOppija(oppija);
                setNaytaDuplikaatit(true);
            } else {
                // luodaan oppija
                luoOppijaJaNavigoi({ ...oppija, yksiloity: true });
            }
        } catch (error) {
            dispatch(
                add({
                    id: `HENKILON_LUONTI_VIRHE-${Math.random()}`,
                    type: 'error',
                    header: L('HENKILON_LUONTI_EPAONNISTUI'),
                })
            );
            throw error;
        }
    };

    const luoOppijaJaNavigoi = async (oppija: HenkiloCreate): Promise<void> => {
        await putOppija(oppija)
            .unwrap()
            .then((oid) => navigate(`/oppija/${oid}`));
    };

    const peruuta = () => {
        window.location.reload();
    };

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">{L('OPPIJAN_LUONTI_OTSIKKO')}</span>
            <span style={{ float: 'right' }}>
                <CloseButton closeAction={goBack} />
            </span>
            {naytaDuplikaatit === false ? (
                <OppijaCreateForm tallenna={tallenna} />
            ) : (
                <OppijaCreateDuplikaatit
                    tallenna={luoOppijaJaNavigoi}
                    peruuta={peruuta}
                    oppija={oppija!}
                    duplikaatit={duplicates ?? []}
                />
            )}
        </div>
    );
};
