import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';

import HenkilohakuPage from './HenkilohakuPage';
import Loader from '../common/icons/Loader';
import { parsePalveluRoolit, hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import { useGetKayttooikeusryhmasQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';

const HenkilohakuContainer = () => {
    const { L } = useLocalisations();
    useTitle(L('TITLE_HENKILOHAKU'));
    useNavigation(mainNavigation, false);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { isLoading } = useGetKayttooikeusryhmasQuery({ passiiviset: true });
    const navigate = useNavigate();
    const vainOppijoidenTuonti = useMemo(() => {
        const kayttooikeudet = parsePalveluRoolit(omattiedot?.organisaatiot);
        return (
            kayttooikeudet.every(
                (kayttooikeus) =>
                    kayttooikeus.startsWith('OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI') ||
                    (!kayttooikeus.startsWith('OPPIJANUMEROREKISTERI') &&
                        !kayttooikeus.startsWith('KAYTTOOIKEUS') &&
                        !kayttooikeus.startsWith('HENKILONHALLINTA'))
            ) && hasAnyPalveluRooli(omattiedot?.organisaatiot, ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'])
        );
    }, [omattiedot]);
    if (vainOppijoidenTuonti) {
        navigate('/oppijoidentuonti');
    }

    return !isLoading ? <HenkilohakuPage /> : <Loader />;
};

export default HenkilohakuContainer;
