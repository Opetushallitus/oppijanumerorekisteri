import React, { useState } from 'react';

import { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types';
import PalvelukayttajaHakuTaulukko from './PalvelukayttajaHakuTaulukko';
import SubOrganisationCheckbox from '../henkilohaku/criterias/SubOrganisationCheckbox';
import './PalvelukayttajaHakuPage.css';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import CloseButton from '../common/button/CloseButton';
import { useLocalisations } from '../../selectors';
import { useGetPalvelukayttajatQuery } from '../../api/kayttooikeus';
import Loader from '../common/icons/Loader';
import { useDebounce } from '../../useDebounce';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';

const defaultCriteria = {
    subOrganisation: 'true',
    nameQuery: '',
};

const PalvelukayttajaHakuPage = () => {
    const { L } = useLocalisations();
    const [organisaatio, setOrganisaatio] = useState<OrganisaatioSelectObject>();
    const [criteria, setCriteria] = useState<PalvelukayttajaCriteria>(defaultCriteria);
    const debouncedCriteria = useDebounce(criteria, 500);
    const { data, isFetching } = useGetPalvelukayttajatQuery(debouncedCriteria, {
        skip: !debouncedCriteria.nameQuery && !debouncedCriteria.organisaatioOid,
    });

    const setOrganisation = (selection?: OrganisaatioSelectObject) => {
        setOrganisaatio(selection);
        setCriteria({ ...criteria, organisaatioOid: selection?.oid });
    };

    return (
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{L['PALVELUKAYTTAJAN_HAKU_OTSIKKO']}</span>
            <div className="PalvelukayttajaHakuPage-criteria">
                <input
                    className="oph-input"
                    defaultValue={criteria.nameQuery}
                    onChange={(e) => setCriteria({ ...criteria, nameQuery: e.target.value })}
                />
                <div className="flex-horizontal organisaatiosuodatus">
                    <div className="flex-item-1 valittu-organisaatio">
                        <input
                            className="oph-input flex-item-1 "
                            type="text"
                            value={organisaatio?.name ?? ''}
                            placeholder={L['PALVELUKAYTTAJA_HAKU_ORGANISAATIOSUODATUS']}
                            readOnly
                        />
                    </div>
                    <OrganisaatioSelectModal onSelect={setOrganisation} />
                    <CloseButton closeAction={() => setOrganisation(undefined)} />
                </div>

                <SubOrganisationCheckbox
                    L={L}
                    subOrganisationValue={criteria.subOrganisation === 'true'}
                    subOrganisationAction={(elem) =>
                        setCriteria({ ...criteria, subOrganisation: String(elem.currentTarget.checked) })
                    }
                />
            </div>
            {isFetching ? <Loader /> : !!data?.length && <PalvelukayttajaHakuTaulukko palvelukayttajat={data} />}
        </div>
    );
};

export default PalvelukayttajaHakuPage;
