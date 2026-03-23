import React from 'react';

import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { OmattiedotPerustiedot } from './OmattiedotPerustiedot';
import { Mfa } from './Mfa';
import { KayttooikeudenAnominen } from './KayttooikeudenAnominen';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsCard } from '../design-system/OphDsCard';
import { OphDsSpinner } from '../design-system/OphDsSpinner';
import { AvoimetKayttooikeusanomukset } from './AvoimetKayttooikeusanomukset';

export const Omattiedot2Page = () => {
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();
    const { L } = useLocalisations();

    useTitle(L('TITLE_OMAT_TIEDOT'));

    if (!isOmattiedotSuccess) {
        return <OphDsSpinner />;
    } else {
        return (
            <OphDsPage header={L('TITLE_OMAT_TIEDOT')}>
                <OmattiedotPerustiedot oid={omattiedot.oidHenkilo} />
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
                    <AvoimetKayttooikeusanomukset oidHenkilo={omattiedot.oidHenkilo} />
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
