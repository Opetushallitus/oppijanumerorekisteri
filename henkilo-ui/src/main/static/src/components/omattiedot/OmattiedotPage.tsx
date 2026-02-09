import React, { useRef } from 'react';

import Loader from '../common/icons/Loader';
import { useGetKayttooikeusAnomuksetForHenkiloQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import Mfa from '../henkilo/Mfa';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { HenkiloViewCreateKayttooikeusanomus } from '../common/henkilo/HenkiloViewCreateKayttooikeusanomus';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';

export const OmattiedotPage = () => {
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();
    const oid = omattiedot?.oidHenkilo;
    const { isSuccess: isHenkiloSuccess } = useGetHenkiloQuery(oid!, { skip: !omattiedot });
    const { L } = useLocalisations();
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const { data: anomukset, isSuccess: isAnomusetSuccess } = useGetKayttooikeusAnomuksetForHenkiloQuery(oid!, {
        skip: !omattiedot,
    });

    useTitle(L['TITLE_OMAT_TIEDOT']);

    if (!isOmattiedotSuccess || !isHenkiloSuccess || !isAnomusetSuccess) {
        return <Loader />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer oidHenkilo={omattiedot.oidHenkilo} view="omattiedot" />
                </div>
                <div className="wrapper">
                    <Mfa henkiloOid={omattiedot.oidHenkilo} view="omattiedot" />
                </div>
                <div className="wrapper">
                    <HenkiloViewContactContent henkiloOid={omattiedot.oidHenkilo} isOmattiedot />
                </div>
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    <HenkiloViewExistingKayttooikeus
                        oidHenkilo={omattiedot.oidHenkilo}
                        isOmattiedot={true}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                    />
                </div>
                <div className="wrapper">
                    <HenkiloViewOpenKayttooikeusanomus anomukset={anomukset ?? []} isOmattiedot={true} />
                </div>
                <div className="wrapper">
                    <HenkiloViewExpiredKayttooikeus oidHenkilo={omattiedot.oidHenkilo} isOmattiedot={true} />
                </div>
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeusanomus henkiloOid={omattiedot.oidHenkilo} />
                </div>
            </div>
        );
    }
};
