import React, { useId, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { type RootState } from '../../../store';
import { toLocalizedText } from '../../../localizabletext';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { useLocalisations } from '../../../selectors';
import ConfirmButton from '../button/ConfirmButton';
import Button from '../button/Button';
import {
    useDeleteHenkiloOrganisationMutation,
    useGetHenkiloOrganisaatiotQuery,
    useGetOrganisationsQuery,
} from '../../../api/kayttooikeus';
import Loader from '../icons/Loader';

import './HenkiloViewOrganisationContent.css';

type OrganisaatioFlat = {
    name: string;
    typesFlat: string;
    passive: boolean;
    id: string;
};

export const HenkiloViewOrganisationContent = () => {
    const { L, locale } = useLocalisations();
    const [showPassive, setShowPassive] = useState(false);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const {
        data: apiOrganisations,
        isSuccess: isApiOrgsSuccess,
        isLoading: isApiOrgsLoading,
    } = useGetOrganisationsQuery();
    const { data: henkiloOrgs, isLoading, isSuccess } = useGetHenkiloOrganisaatiotQuery(henkilo.henkilo.oidHenkilo);
    const [deleteHenkiloOrganisation] = useDeleteHenkiloOrganisationMutation();

    function passivoiHenkiloOrganisation(organisationOid: string) {
        deleteHenkiloOrganisation({ henkiloOid: henkilo.henkilo.oidHenkilo, organisationOid });
    }

    const flatOrganisations: OrganisaatioFlat[] = useMemo(() => {
        return isSuccess && isApiOrgsSuccess && henkiloOrgs
            ? henkiloOrgs?.map((org) => {
                  const organisation = apiOrganisations?.find((o) => o.oid === org.organisaatioOid);
                  const typesFlat = organisation?.tyypit?.length ? '(' + organisation?.tyypit?.join(', ') + ')' : '';
                  return {
                      name: toLocalizedText(locale, organisation?.nimi),
                      typesFlat: typesFlat,
                      passive: org.passivoitu,
                      id: organisation?.oid,
                  };
              })
            : [];
    }, [isApiOrgsSuccess, isSuccess, apiOrganisations, henkiloOrgs]);

    const sectionLabelId = useId();

    if (isLoading || isApiOrgsLoading) {
        return <Loader />;
    }

    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L['HENKILO_ORGANISAATIOT_OTSIKKO']}</h2>
            <label className="oph-checkable" htmlFor="showPassive">
                <input
                    id="showPassive"
                    type="checkbox"
                    className="oph-checkable-input"
                    onChange={() => setShowPassive(!showPassive)}
                />
                <span className="oph-checkable-text"> {L['HENKILO_NAYTA_PASSIIVISET_TEKSTI']}</span>
            </label>
            <div className="organisationContentWrapper">
                {flatOrganisations.map((values, idx) =>
                    !values.passive || showPassive ? (
                        <div key={idx}>
                            <div>
                                <span className="oph-bold">
                                    {values.name} {values.typesFlat}
                                </span>
                            </div>
                            <div className="labelValue">
                                <span className="oph-bold">{L['HENKILO_ORGTUNNISTE']}:</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{values.id}</span>
                            </div>
                            <div className="labelValue">
                                {!values.passive ? (
                                    <ConfirmButton
                                        key="passivoiOrg"
                                        action={() => passivoiHenkiloOrganisation(values.id)}
                                        confirmLabel={L['HENKILO_ORG_PASSIVOI_CONFIRM']}
                                        normalLabel={L['HENKILO_ORG_PASSIVOI']}
                                    />
                                ) : (
                                    <Button disabled>{L['HENKILO_ORG_PASSIVOITU']}</Button>
                                )}
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </section>
    );
};
