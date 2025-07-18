import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { urls } from 'oph-urls-js';

import { http } from '../../../../../http';
import {
    fetchKieliKoodisto,
    fetchSukupuoliKoodisto,
    fetchKansalaisuusKoodisto,
} from '../../../../../actions/koodisto.actions';
import OppijaCreateForm from './OppijaCreateForm';
import { HenkiloCreate } from '../../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloDuplicate } from '../../../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import OppijaCreateDuplikaatit from './OppijaCreateDuplikaatit';
import { addGlobalNotification } from '../../../../../actions/notification.actions';
import { NOTIFICATIONTYPES } from '../../../../common/Notification/notificationtypes';
import CloseButton from '../../../../common/button/CloseButton';
import { RootState, useAppDispatch } from '../../../../../store';
import { useLocalisations } from '../../../../../selectors';
import { KoodistoState } from '../../../../../reducers/koodisto.reducer';

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
    const koodisto = useSelector<RootState, KoodistoState>((state) => state.koodisto);
    const [naytaDuplikaatit, setNaytaDuplikaatit] = useState(false);
    const [duplikaatit, setDuplikaatit] = useState([]);

    useEffect(() => {
        dispatch<any>(fetchSukupuoliKoodisto());
        dispatch<any>(fetchKieliKoodisto());
        dispatch<any>(fetchKansalaisuusKoodisto());
    }, []);

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
                addGlobalNotification({
                    key: 'HENKILON_LUONTI_VIRHE',
                    type: NOTIFICATIONTYPES.ERROR,
                    title: L['HENKILON_LUONTI_EPAONNISTUI'],
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
                    sukupuoliKoodisto={koodisto.sukupuoliKoodisto}
                    kieliKoodisto={koodisto.kieliKoodisto}
                    kansalaisuusKoodisto={koodisto.kansalaisuusKoodisto}
                />
            ) : (
                <OppijaCreateDuplikaatit
                    locale={locale}
                    L={L}
                    tallenna={luoOppijaJaNavigoi}
                    peruuta={peruuta}
                    oppija={oppija}
                    duplikaatit={duplikaatit}
                />
            )}
        </div>
    );
};
