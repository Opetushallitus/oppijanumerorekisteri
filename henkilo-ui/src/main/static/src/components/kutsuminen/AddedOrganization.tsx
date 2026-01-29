import React from 'react';
import { SingleValue } from 'react-select';
import ReactDatePicker from 'react-datepicker';
import { addYears, format, isAfter, isBefore, parseISO } from 'date-fns';

import { OphDsRyhmaSelect } from '../design-system/OphDsRyhmaSelect';
import { findOmattiedotOrganisatioOrRyhmaByOid } from '../../utilities/organisaatio.util';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import KayttooikeusryhmaSelectModal from '../common/select/KayttooikeusryhmaSelectModal';
import { myonnettyToKayttooikeusryhma } from '../../utils/KayttooikeusryhmaUtils';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { useLocalisations } from '../../selectors';
import { isOrganisaatioSelection, OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import {
    useGetAllowedKayttooikeusryhmasForOrganisationQuery,
    useGetOmatOrganisaatiotQuery,
    useGetOmattiedotQuery,
    useGetOrganisationNamesQuery,
} from '../../api/kayttooikeus';
import { SelectOption } from '../../utilities/select';
import { localizeTextGroup } from '../../utilities/localisation.util';

import './AddedOrganization.css';

type OwnProps = {
    addedOrg: KutsuOrganisaatio;
    updateOrganisation: (o: KutsuOrganisaatio) => void;
    removeOrganisation: () => void;
};

const AddedOrganization = ({ addedOrg, updateOrganisation, removeOrganisation }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const oid = omattiedot?.oidHenkilo;
    const { data: omatOrganisaatios } = useGetOmatOrganisaatiotQuery({ oid: oid!, locale }, { skip: !omattiedot });
    const { data: organisationNames } = useGetOrganisationNamesQuery();
    const selectedOrganisaatioOid = addedOrg.organisation?.oid;
    const { data: allPermissions, isLoading } = useGetAllowedKayttooikeusryhmasForOrganisationQuery(
        { oidHenkilo: oid!, oidOrganisaatio: selectedOrganisaatioOid },
        {
            skip: !omattiedot || !selectedOrganisaatioOid,
        }
    );
    const selectablePermissions = allPermissions
        ? allPermissions.filter((p) => !addedOrg.selectedPermissions.find((s) => s.ryhmaId === p.ryhmaId))
        : [];
    const kayttooikeusryhmat = selectablePermissions.map(myonnettyToKayttooikeusryhma);

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

    function removePermission(permission: MyonnettyKayttooikeusryhma, e: React.SyntheticEvent<EventTarget>) {
        e.preventDefault();
        const selectedPermissions = addedOrg.selectedPermissions.filter((s) => s.ryhmaId !== permission.ryhmaId);
        updateOrganisation({ ...addedOrg, selectedPermissions });
    }

    function selectOrganisaatio(selection: OrganisaatioSelectObject | SingleValue<SelectOption>) {
        if (!selection) {
            return;
        }
        const isOrganisaatio = isOrganisaatioSelection(selection);
        const selectedOrganisaatioOid = isOrganisaatio ? selection.oid : selection.value;
        const organisaatio = isOrganisaatio
            ? selection
            : findOmattiedotOrganisatioOrRyhmaByOid(
                  selectedOrganisaatioOid,
                  omatOrganisaatios!,
                  organisationNames!,
                  locale
              );
        if (organisaatio) {
            const newOrg: Partial<KutsuOrganisaatio> = {
                organisation: { ...organisaatio, type: isOrganisaatio ? 'organisaatio' : 'ryhma' },
                selectedPermissions: [],
            };
            updateOrganisation({ ...addedOrg, ...newOrg });
        }
    }

    return (
        <div className="added-org">
            <div className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}</h3>
                    <button
                        className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                        title={L['POISTA']}
                        onClick={() => removeOrganisation()}
                    />
                </div>
                <div className="flex-horizontal">
                    <input
                        className="oph-input flex-item-1 kutsuminen-organisaatiosuodatus"
                        type="text"
                        value={addedOrg.organisation?.name ?? ''}
                        placeholder={L['VIRKAILIJAN_LISAYS_ORGANISAATIO']}
                        readOnly
                    />
                    <OrganisaatioSelectModal onSelect={selectOrganisaatio} />
                </div>
                <div>
                    <OphDsRyhmaSelect
                        selectedOrganisaatioOid={selectedOrganisaatioOid}
                        selectOrganisaatio={selectOrganisaatio}
                    />
                </div>
            </div>

            <div className="row permissions-row">
                <label htmlFor="permissions">{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']}</label>

                <div className="permissionSelect">
                    <KayttooikeusryhmaSelectModal
                        kayttooikeusryhmat={kayttooikeusryhmat}
                        kayttooikeusryhmaValittu={addedOrg.selectedPermissions.length > 0}
                        onSelect={addPermission}
                        isOrganisaatioSelected={!!addedOrg.organisation.oid}
                        loading={isLoading}
                        sallittuKayttajatyyppi="VIRKAILIJA"
                    />
                </div>

                <ul className="kutsuminen-selected-permissions">
                    {addedOrg.selectedPermissions.map((permission) => {
                        return (
                            <li key={permission.ryhmaId}>
                                {localizeTextGroup(permission.ryhmaNames?.texts, locale)}
                                <i
                                    className="fa fa-times-circle right remove-icon"
                                    onClick={(e) => removePermission(permission, e)}
                                    aria-hidden="true"
                                />
                            </li>
                        );
                    })}
                </ul>

                <div className="clear" />

                <label>{L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</label>
                <div>
                    <ReactDatePicker
                        className="oph-input"
                        onChange={(value) =>
                            value ? selectVoimassaLoppuPvm(format(value, 'yyyy-MM-dd')) : selectVoimassaLoppuPvm(null)
                        }
                        selected={addedOrg.voimassaLoppuPvm ? parseISO(addedOrg.voimassaLoppuPvm) : null}
                        showYearDropdown
                        showWeekNumbers
                        filterDate={(date) => isAfter(date, new Date()) && isBefore(date, addYears(new Date(), 1))}
                        dateFormat={'d.M.yyyy'}
                    />
                </div>
            </div>
            <div className="clear" />
        </div>
    );
};

export default AddedOrganization;
