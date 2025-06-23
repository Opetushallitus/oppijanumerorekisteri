import React, { useState } from 'react';
import { Link } from 'react-router';

import { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types';
import { useLocalisations } from '../../selectors';
import { useGetPalvelukayttajatQuery } from '../../api/kayttooikeus';
import Loader from '../common/icons/Loader';
import { useDebounce } from '../../useDebounce';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsChechbox } from '../design-system/OphDsCheckbox';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';

import './JarjestelmatunnusListPage.css';
import { OphDsTable } from '../design-system/OphDsTable';

const defaultCriteria = {
    subOrganisation: 'true',
    nameQuery: '',
};

export const JarjestelmatunnusListPage = () => {
    const { L } = useLocalisations();
    const [criteria, setCriteria] = useState<PalvelukayttajaCriteria>(defaultCriteria);
    const debouncedCriteria = useDebounce(criteria, 500);
    const { data, isFetching } = useGetPalvelukayttajatQuery(debouncedCriteria, {
        skip: !debouncedCriteria.nameQuery && !debouncedCriteria.organisaatioOid,
    });

    const setOrganisationCriteria = (selection?: OrganisaatioSelectObject) =>
        setCriteria({ ...criteria, organisaatioOid: selection?.oid });

    return (
        <OphDsPage header={L['JARJESTELMATUNNUSTEN_HAKU']}>
            <div className="jarjestelmatunnus-haku-form">
                <OphDsInput
                    id="filter"
                    label={L['SUODATA_PALVELUN_NIMELLA']}
                    onChange={(nameQuery) => setCriteria({ ...criteria, nameQuery })}
                />
                <div>
                    <label htmlFor="organisaatio-select" className="oph-ds-label">
                        {L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                    </label>
                    <OphDsOrganisaatioSelect onChange={setOrganisationCriteria} />
                </div>
            </div>
            <div className="jarjestelmatunnus-haku-form">
                <OphDsChechbox
                    checked={criteria.subOrganisation === 'true'}
                    id="subOrganisations"
                    label={L['HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA']}
                    onChange={() =>
                        setCriteria({
                            ...criteria,
                            subOrganisation: criteria.subOrganisation === 'true' ? 'false' : 'true',
                        })
                    }
                />
            </div>
            <OphDsTable
                headers={[L['HENKILO_PALVELUN_NIMI'], L['HENKILO_KAYTTAJANIMI']]}
                rows={(data ?? []).map((d) => [
                    <Link key={`link-${d.kayttajatunnus}`} to={`/jarjestelmatunnus/${d.oid}`} className="oph-ds-link">
                        {d.nimi}
                    </Link>,
                    <span key={`nimi-${d.kayttajatunnus}`}>{d.kayttajatunnus}</span>,
                ])}
                rowDescriptionPartitive={L['JARJESTELMATUNNUSTA']}
            />
            {isFetching && <Loader />}
        </OphDsPage>
    );
};
