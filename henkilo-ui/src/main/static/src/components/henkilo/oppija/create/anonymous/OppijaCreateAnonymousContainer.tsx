import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { urls } from 'oph-urls-js';

import { http } from '../../../../../http';
import OppijaCreateForm from './OppijaCreateForm';
import { HenkiloCreate } from '../../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloDuplicate } from '../../../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import OppijaCreateDuplikaatit from './OppijaCreateDuplikaatit';
import CloseButton from '../../../../common/button/CloseButton';
import { useAppDispatch } from '../../../../../store';
import { useLocalisations } from '../../../../../selectors';
import { useGetKansalaisuudetQuery, useGetKieletQuery, useGetSukupuoletQuery } from '../../../../../api/koodisto';
import { add } from '../../../../../slices/toastSlice';

type OwnProps = {
    goBack: () => void;
};

/**
 * Oppijan luonti -näkymä.
 */
export const OppijaCreateAnonymousContainer = ({ goBack }: OwnProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { L, locale } = useLocalisations();
    const [oppija, setOppija] = useState({});
    const [naytaDuplikaatit, setNaytaDuplikaatit] = useState(false);
    const [duplikaatit, setDuplikaatit] = useState([]);
    const { data: kielet } = useGetKieletQuery();
    const { data: kansalaisuudet } = useGetKansalaisuudetQuery();
    const { data: sukupuolet } = useGetSukupuoletQuery();

    const tallenna = async (oppija: HenkiloCreate) => {
        try {
            // tarkistetaan ennen luontia duplikaatit
            const duplikaatit = await haeDuplikaatit(oppija);
            if (duplikaatit.length > 0) {
                setOppija(oppija);
                setNaytaDuplikaatit(true);
                setDuplikaatit(duplikaatit);
            } else {
                // luodaan oppija
                luoOppijaJaNavigoi({ ...oppija, yksiloity: true });
            }
        } catch (error) {
            dispatch(
                add({
                    id: `HENKILON_LUONTI_VIRHE-${Math.random()}`,
                    type: 'error',
                    header: L['HENKILON_LUONTI_EPAONNISTUI'],
                })
            );
            throw error;
        }
    };

    const luoOppijaJaNavigoi = async (oppija: HenkiloCreate): Promise<void> => {
        const oid = await luoOppija(oppija);
        navigate(`/oppija/${oid}`);
    };

    const peruuta = () => {
        window.location.reload();
    };

    const haeDuplikaatit = (oppija: HenkiloCreate): Promise<Array<HenkiloDuplicate>> => {
        const url = urls.url(
            'oppijanumerorekisteri-service.henkilo.duplikaatit',
            oppija.etunimet,
            oppija.kutsumanimi,
            oppija.sukunimi,
            oppija.syntymaaika
        );
        return http.get(url);
    };

    const luoOppija = (oppija: HenkiloCreate): Promise<string> => {
        const url = urls.url('oppijanumerorekisteri-service.oppija');
        return http.post(url, oppija); // palauttaa oid
    };

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">{L['OPPIJAN_LUONTI_OTSIKKO']}</span>
            <span style={{ float: 'right' }}>
                <CloseButton closeAction={goBack} />
            </span>
            {naytaDuplikaatit === false ? (
                <OppijaCreateForm
                    tallenna={tallenna}
                    locale={locale}
                    L={L}
                    sukupuoliKoodisto={sukupuolet}
                    kieliKoodisto={kielet}
                    kansalaisuusKoodisto={kansalaisuudet}
                />
            ) : (
                <OppijaCreateDuplikaatit
                    tallenna={luoOppijaJaNavigoi}
                    peruuta={peruuta}
                    oppija={oppija}
                    duplikaatit={duplikaatit}
                />
            )}
        </div>
    );
};
