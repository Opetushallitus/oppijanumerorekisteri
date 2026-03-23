import React from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { useGetKayttooikeusAnomuksetForHenkiloQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { Mfa } from './Mfa';
import { KayttooikeudenAnominen } from './KayttooikeudenAnominen';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsCard } from '../design-system/OphDsCard';
import { OphDsSpinner } from '../design-system/OphDsSpinner';

export const Omattiedot2Page = () => {
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();
    const { L } = useLocalisations();
    const { data: anomukset } = useGetKayttooikeusAnomuksetForHenkiloQuery(omattiedot?.oidHenkilo ?? skipToken);

    useTitle(L('TITLE_OMAT_TIEDOT'));

    if (!isOmattiedotSuccess) {
        return <OphDsSpinner />;
    } else {
        return (
            <OphDsPage header={L('TITLE_OMAT_TIEDOT')}>
                <UserContentContainer oidHenkilo={omattiedot.oidHenkilo} view="omattiedot" />
                <OphDsCard>
                    <Mfa />
                </OphDsCard>
                <OphDsCard>
                    <HenkiloViewContactContent henkiloOid={omattiedot.oidHenkilo} isOmattiedot />
                </OphDsCard>
                <OphDsCard>
                    <HenkiloViewExistingKayttooikeus oidHenkilo={omattiedot.oidHenkilo} isOmattiedot={true} />
                </OphDsCard>
                <OphDsCard>
                    <HenkiloViewOpenKayttooikeusanomus anomukset={anomukset ?? []} isOmattiedot={true} />
                </OphDsCard>
                <OphDsCard>
                    <HenkiloViewExpiredKayttooikeus oidHenkilo={omattiedot.oidHenkilo} isOmattiedot={true} />
                </OphDsCard>
                <OphDsCard>
                    <KayttooikeudenAnominen henkiloOid={omattiedot.oidHenkilo} />
                </OphDsCard>
            </OphDsPage>
        );
    }
};
