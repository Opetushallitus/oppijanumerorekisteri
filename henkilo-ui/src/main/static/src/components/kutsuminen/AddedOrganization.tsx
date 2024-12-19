import React from 'react';
import { useSelector } from 'react-redux';
import { difference } from 'ramda';
import moment from 'moment';
import type { Option } from 'react-select';

import type { RootState } from '../../store';
import { toLocalizedText } from '../../localizabletext';
import RyhmaSelection from '../common/select/RyhmaSelection';
import { findOmattiedotOrganisatioOrRyhmaByOid } from '../../utilities/organisaatio.util';
import { KutsuOrganisaatio, OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import KayttooikeusryhmaSelectModal from '../common/select/KayttooikeusryhmaSelectModal';
import { myonnettyToKayttooikeusryhma } from '../../utils/KayttooikeusryhmaUtils';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import SimpleDatePicker from '../henkilo/SimpleDatePicker';
import CrossCircleIcon from '../common/icons/CrossCircleIcon';
import type { OrganisaatioNameLookup } from '../../reducers/organisaatio.reducer';
import { useLocalisations } from '../../selectors';
import { isOrganisaatioSelection, OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { useGetAllowedKayttooikeusryhmasForOrganisationQuery } from '../../api/kayttooikeus';

import './AddedOrganization.css';

type OwnProps = {
    addedOrg: KutsuOrganisaatio;
    updateOrganisation: (o: KutsuOrganisaatio) => void;
    removeOrganisation: () => void;
};

const AddedOrganization = ({ addedOrg, updateOrganisation, removeOrganisation }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const oidHenkilo = useSelector<RootState, string>((state) => state.omattiedot?.data.oid);
    const omatOrganisaatios = useSelector<RootState, OrganisaatioHenkilo[]>((state) => state.omattiedot.organisaatios);
    const organisationNames = useSelector<RootState, OrganisaatioNameLookup>((state) => state.organisaatio.names);
    const selectedOrganisaatioOid = addedOrg.organisation?.oid;
    const { data: allPermissions, isLoading } = useGetAllowedKayttooikeusryhmasForOrganisationQuery(
        { oidHenkilo, oidOrganisaatio: selectedOrganisaatioOid },
        {
            skip: !oidHenkilo || !selectedOrganisaatioOid,
        }
    );
    const selectablePermissions = allPermissions ? difference(allPermissions, addedOrg.selectedPermissions) : [];
    const kayttooikeusryhmat = selectablePermissions.map(myonnettyToKayttooikeusryhma);

    const selectVoimassaLoppuPvm = (voimassaLoppuPvm: string | null | undefined) => {
        updateOrganisation({ ...addedOrg, voimassaLoppuPvm });
    };

    function addPermission(kayttooikeusryhma: Kayttooikeusryhma) {
        const selectedPermission = selectablePermissions.find((s) => s.ryhmaId === kayttooikeusryhma.id);
        const newOrg = { ...addedOrg, selectedPermissions: [...addedOrg.selectedPermissions, selectedPermission] };
        updateOrganisation(newOrg);
    }

    function removePermission(permission: MyonnettyKayttooikeusryhma, e: React.SyntheticEvent<EventTarget>) {
        e.preventDefault();
        const selectedPermissions = addedOrg.selectedPermissions.filter((s) => s.ryhmaId !== permission.ryhmaId);
        updateOrganisation({ ...addedOrg, selectedPermissions });
    }

    function selectOrganisaatio(selection: OrganisaatioSelectObject | Option<string>) {
        if (!selection) {
            return;
        }
        console.log(selection);
        const isOrganisaatio = isOrganisaatioSelection(selection);
        console.log(isOrganisaatio);
        const selectedOrganisaatioOid = isOrganisaatio ? selection.oid : selection.value;
        const organisaatio: OrganisaatioSelectObject = isOrganisaatio
            ? selection
            : findOmattiedotOrganisatioOrRyhmaByOid(
                  selectedOrganisaatioOid,
                  omatOrganisaatios,
                  organisationNames,
                  locale
              );
        console.log(organisaatio);
        if (organisaatio) {
            const newOrg: Partial<KutsuOrganisaatio> = {
                organisation: { ...organisaatio, type: isOrganisaatio ? 'organisaatio' : 'ryhma' },
                selectedPermissions: [],
            };
            updateOrganisation({ ...addedOrg, ...newOrg });
        }
    }
    console.log(addedOrg);
    return (
        <div className="added-org">
            <div className="row">
                <div className="flex-horizontal" style={{ justifyContent: 'space-between' }}>
                    <label htmlFor="org">{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}</label>
                    <div style={{ paddingTop: '20px', fontSize: '1.5em' }} onClick={() => removeOrganisation()}>
                        <CrossCircleIcon />
                    </div>
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
                    <RyhmaSelection
                        selectedOrganisaatioOid={selectedOrganisaatioOid}
                        selectOrganisaatio={selectOrganisaatio}
                    />
                </div>
            </div>

            <div className="row permissions-row">
                <label htmlFor="permissions">{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']}</label>

                <div className="permissionSelect">
                    <KayttooikeusryhmaSelectModal
                        locale={locale}
                        L={L}
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
                                {toLocalizedText(locale, permission.ryhmaNames)}
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
                    <SimpleDatePicker
                        className="oph-input"
                        value={addedOrg.voimassaLoppuPvm}
                        onChange={selectVoimassaLoppuPvm}
                        filterDate={(date) => moment(date).isBetween(moment(), moment().add(1, 'years'), 'day', '[]')}
                    />
                </div>
            </div>
            <div className="clear" />
        </div>
    );
};

export default AddedOrganization;
