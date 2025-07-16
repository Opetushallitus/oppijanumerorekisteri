import React, { useMemo } from 'react';
import HenkilohakuPage from './HenkilohakuPage';
import { RouteActions } from 'react-router-redux';

import Loader from '../common/icons/Loader';
import { parsePalveluRoolit, hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import { useGetKayttooikeusryhmasQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';

type OwnProps = {
    router: RouteActions;
};

const HenkilohakuContainer = ({ router }: OwnProps) => {
    const { L } = useLocalisations();
    useTitle(L['TITLE_HENKILOHAKU']);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { isLoading } = useGetKayttooikeusryhmasQuery({ passiiviset: true });
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

    return !isLoading ? <HenkilohakuPage /> : <Loader />;
};

export default HenkilohakuContainer;
