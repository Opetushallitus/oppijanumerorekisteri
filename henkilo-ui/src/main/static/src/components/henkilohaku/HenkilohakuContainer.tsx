import React, { useEffect, useMemo } from 'react';
import HenkilohakuPage from './HenkilohakuPage';
import { useSelector } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import { useAppDispatch, type RootState } from '../../store';
import Loader from '../common/icons/Loader';
import { fetchAllKayttooikeusryhma } from '../../actions/kayttooikeusryhma.actions';
import { fetchAllRyhmas } from '../../actions/organisaatio.actions';
import { parsePalveluRoolit, hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';

type OwnProps = {
    router: RouteActions;
};

const HenkilohakuContainer = ({ router }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const isLoading = useSelector<RootState, boolean>((state) => state.kayttooikeus.allKayttooikeusryhmasLoading);
    const vainOppijoidenTuonti = useMemo(() => {
        const kayttooikeudet = parsePalveluRoolit(omattiedot.organisaatiot);
        return (
            kayttooikeudet.every(
                (kayttooikeus) =>
                    kayttooikeus.startsWith('OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI') ||
                    (!kayttooikeus.startsWith('OPPIJANUMEROREKISTERI') &&
                        !kayttooikeus.startsWith('KAYTTOOIKEUS') &&
                        !kayttooikeus.startsWith('HENKILONHALLINTA'))
            ) && hasAnyPalveluRooli(omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'])
        );
    }, [omattiedot]);
    if (vainOppijoidenTuonti) {
        router.replace('/oppijoidentuonti');
    }

    useEffect(() => {
        dispatch<any>(fetchAllKayttooikeusryhma());
        dispatch<any>(fetchAllRyhmas());
    }, []);

    return !isLoading ? <HenkilohakuPage /> : <Loader />;
};

export default HenkilohakuContainer;
