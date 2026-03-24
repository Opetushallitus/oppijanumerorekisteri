import React, { useState } from 'react';
import { SingleValue } from 'react-select';
import { addYears, format, parseISO } from 'date-fns';
import { skipToken } from '@reduxjs/toolkit/query';

import { OphDsDatepicker } from '../design-system/OphDsDatePicker';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';
import { OphDsRyhmaSelect } from '../design-system/OphDsRyhmaSelect';
import { OphDsCard } from '../design-system/OphDsCard';
import { findOmattiedotOrganisatioOrRyhmaByOid } from '../../utilities/organisaatio.util';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import KayttooikeusryhmaSelectModal from '../common/select/KayttooikeusryhmaSelectModal';
import { myonnettyToKayttooikeusryhma } from '../../utils/KayttooikeusryhmaUtils';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { useLocalisations } from '../../selectors';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import {
    useGetAllowedKayttooikeusryhmasForOrganisationQuery,
    useGetOmatOrganisaatiotQuery,
    useGetOmattiedotQuery,
    useGetOrganisationNamesQuery,
} from '../../api/kayttooikeus';
import { SelectOption } from '../../utilities/select';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';
import { emptyOrganisation } from './KutsuminenPage';

import styles from './KutsuminenOrganisation.module.css';

type OwnProps = {
    index: number;
    addedOrg: KutsuOrganisaatio;
    updateOrganisation: (o: KutsuOrganisaatio) => void;
    removeOrganisation: () => void;
};

export const KutsuminenOrganisation = ({ addedOrg, index, updateOrganisation, removeOrganisation }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const oid = omattiedot?.oidHenkilo;
    const { data: omatOrganisaatios } = useGetOmatOrganisaatiotQuery(oid ? { oid, locale } : skipToken);
    const { data: organisationNames } = useGetOrganisationNamesQuery();
    const selectedOrganisaatioOid = addedOrg.organisation?.oid;
    const { data: allPermissions, isLoading } = useGetAllowedKayttooikeusryhmasForOrganisationQuery(
        oid && selectedOrganisaatioOid ? { oidHenkilo: oid, oidOrganisaatio: selectedOrganisaatioOid } : skipToken
    );
    const selectablePermissions = allPermissions
        ? allPermissions.filter((p) => !addedOrg.selectedPermissions.find((s) => s.ryhmaId === p.ryhmaId))
        : [];
    const kayttooikeusryhmat = selectablePermissions.map(myonnettyToKayttooikeusryhma);
    const [selectedType, setSelectedType] = useState<'organisaatio' | 'ryhma' | undefined>();

    const selectVoimassaLoppuPvm = (voimassaLoppuPvm: string | null) => {
        updateOrganisation({ ...addedOrg, voimassaLoppuPvm });
    };

    function addPermission(kayttooikeusryhma: Kayttooikeusryhma) {
        const selectedPermission = selectablePermissions.find((s) => s.ryhmaId === kayttooikeusryhma.id);
        if (selectedPermission) {
            const newOrg = { ...addedOrg, selectedPermissions: [...addedOrg.selectedPermissions, selectedPermission] };
            updateOrganisation(newOrg);
        }
    }

    function removePermission(permission: MyonnettyKayttooikeusryhma) {
        const selectedPermissions = addedOrg.selectedPermissions.filter((s) => s.ryhmaId !== permission.ryhmaId);
        updateOrganisation({ ...addedOrg, selectedPermissions });
    }

    function selectRyhma(selection: SingleValue<SelectOption>) {
        const organisaatio = findOmattiedotOrganisatioOrRyhmaByOid(
            locale,
            selection?.value,
            omatOrganisaatios,
            organisationNames
        );
        if (organisaatio) {
            const newOrg: Partial<KutsuOrganisaatio> = {
                organisation: { ...organisaatio, type: 'ryhma' },
                selectedPermissions: [],
            };
            setSelectedType('ryhma');
            updateOrganisation({ ...addedOrg, ...newOrg });
        } else {
            setSelectedType(undefined);
            updateOrganisation(emptyOrganisation());
        }
    }

    function selectOrganisaatio(selection: SingleValue<OrganisaatioSelectObject>) {
        if (selection) {
            const newOrg: Partial<KutsuOrganisaatio> = {
                organisation: { oid: selection?.oid, name: selection?.name, type: 'organisaatio' },
                selectedPermissions: [],
            };
            setSelectedType('organisaatio');
            updateOrganisation({ ...addedOrg, ...newOrg });
        } else {
            setSelectedType(undefined);
            updateOrganisation(emptyOrganisation());
        }
    }

    return (
        <OphDsCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-testid={`addedorg-${index}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{L('VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO')}</h3>
                    <button
                        className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                        title={L('POISTA')}
                        onClick={() => removeOrganisation()}
                    />
                </div>
                <div style={{ maxWidth: '700px' }}>
                    <OphDsOrganisaatioSelect
                        inputId={`organisaatio-${index}`}
                        onChange={selectOrganisaatio}
                        selectedOrganisaatioOid={selectedOrganisaatioOid}
                        disabled={selectedType === 'ryhma'}
                    />
                </div>
                <div style={{ maxWidth: '700px' }}>
                    <OphDsRyhmaSelect
                        inputId={`ryhma-${index}`}
                        selectOrganisaatio={selectRyhma}
                        selectedOrganisaatioOid={selectedOrganisaatioOid}
                        disabled={selectedType === 'organisaatio'}
                    />
                </div>
                {!!addedOrg.organisation.oid && (
                    <>
                        <h4>{L('VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA')}</h4>
                        <div>
                            <KayttooikeusryhmaSelectModal
                                kayttooikeusryhmat={kayttooikeusryhmat}
                                kayttooikeusryhmaValittu={addedOrg.selectedPermissions.length > 0}
                                onSelect={addPermission}
                                isOrganisaatioSelected={!!addedOrg.organisation.oid}
                                loading={isLoading}
                                sallittuKayttajatyyppi="VIRKAILIJA"
                            />
                        </div>
                        <div className={styles.selectedKayttooikeus}>
                            {addedOrg.selectedPermissions.map((permission) => {
                                return (
                                    <div key={permission.ryhmaId}>
                                        {getTextGroupLocalisation(permission.ryhmaNames, locale)}
                                        <button
                                            className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                                            onClick={() => removePermission(permission)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <h4>{L('HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY')}</h4>
                        <div>
                            <div>
                                <OphDsDatepicker
                                    id={`voimassa-${index}`}
                                    onChange={(value: Date | null) =>
                                        selectVoimassaLoppuPvm(value ? format(value, 'yyyy-MM-dd') : null)
                                    }
                                    selected={addedOrg.voimassaLoppuPvm ? parseISO(addedOrg.voimassaLoppuPvm) : null}
                                    minDate={new Date()}
                                    maxDate={addYears(new Date(), 1)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </OphDsCard>
    );
};
