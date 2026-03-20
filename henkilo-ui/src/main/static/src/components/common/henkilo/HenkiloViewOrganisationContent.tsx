import React, { useId, useMemo, useState } from 'react';

import { useLocalisations } from '../../../selectors';
import ConfirmButton from '../button/ConfirmButton';
import {
    useDeleteHenkiloOrganisationMutation,
    useGetHenkiloOrganisaatiotQuery,
    useGetOrganisationsQuery,
} from '../../../api/kayttooikeus';
import { OphDsChechbox } from '../../design-system/OphDsCheckbox';
import { getLocalization } from '../../../utilities/localisation.util';
import { OphDsTable } from '../../design-system/OphDsTable';

type OrganisaatioFlat = {
    name?: string;
    typesFlat: string;
    passive: boolean;
    id: string;
};

export const HenkiloViewOrganisationContent = ({ henkiloOid }: { henkiloOid: string }) => {
    const { L, locale } = useLocalisations();
    const [showPassive, setShowPassive] = useState(false);
    const { data: apiOrganisations, isLoading: isApiOrgsLoading } = useGetOrganisationsQuery();
    const { data: henkiloOrgs, isLoading } = useGetHenkiloOrganisaatiotQuery(henkiloOid);
    const [deleteHenkiloOrganisation] = useDeleteHenkiloOrganisationMutation();

    function passivoiHenkiloOrganisation(organisationOid: string) {
        if (!organisationOid) {
            return;
        }
        deleteHenkiloOrganisation({ henkiloOid, organisationOid });
    }

    const flatOrganisations: OrganisaatioFlat[] = useMemo(() => {
        return henkiloOrgs && apiOrganisations
            ? henkiloOrgs
                  .map((org) => {
                      const organisation = apiOrganisations?.find((o) => o.oid === org.organisaatioOid);
                      return {
                          name: getLocalization(organisation?.nimi, locale),
                          typesFlat: organisation?.tyypit?.length ? '(' + organisation?.tyypit?.join(', ') + ')' : '',
                          passive: org.passivoitu,
                          id: org.organisaatioOid,
                      };
                  })
                  .filter((o) => showPassive || !o.passive)
            : [];
    }, [apiOrganisations, henkiloOrgs, showPassive]);

    const sectionLabelId = useId();

    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L('HENKILO_ORGANISAATIOT_OTSIKKO')}</h2>
            <div>
                <OphDsChechbox
                    id="showPassive"
                    label={L('HENKILO_NAYTA_PASSIIVISET_TEKSTI')}
                    checked={showPassive}
                    onChange={() => setShowPassive(!showPassive)}
                />
            </div>
            <OphDsTable
                headers={[L('HENKILOHAKU_ORGANISAATIO'), L('HENKILO_ORGTUNNISTE'), '']}
                rows={flatOrganisations.map((o, idx) => [
                    <span key={`oname-${idx}`} style={{ fontWeight: showPassive && !o.passive ? 600 : 400 }}>
                        {o.name} {o.typesFlat}
                    </span>,
                    <span key={`ooid-${idx}`} style={{ fontWeight: showPassive && !o.passive ? 600 : 400 }}>
                        {o.id}
                    </span>,
                    <span key={`oremove-${idx}`}>
                        {!o.passive ? (
                            <ConfirmButton
                                className="oph-ds-button oph-ds-button-transparent oph-ds-button-icon oph-ds-icon-button-delete"
                                action={() => passivoiHenkiloOrganisation(o.id)}
                                confirmLabel={L('HENKILO_ORG_PASSIVOI_CONFIRM')}
                                normalLabel={L('HENKILO_ORG_PASSIVOI')}
                            />
                        ) : (
                            <span>{L('HENKILO_ORG_PASSIVOITU')}</span>
                        )}
                    </span>,
                ])}
                isFetching={isLoading || isApiOrgsLoading}
            />
        </section>
    );
};
