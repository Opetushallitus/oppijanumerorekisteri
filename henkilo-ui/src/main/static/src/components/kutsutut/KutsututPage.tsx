import React, { useMemo, useState } from 'react';
import moment from 'moment';
import Select, { createFilter } from 'react-select';

import Button from '../common/button/Button';
import KutsututTable from './KutsututTable';
import KutsututBooleanRadioButton from './KutsututBooleanRadioButton';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import CloseButton from '../common/button/CloseButton';
import { useLocalisations } from '../../selectors';
import {
    useDeleteKutsuMutation,
    useGetKayttooikeusryhmasQuery,
    useGetOmattiedotQuery,
    useGetOrganisaatioRyhmatQuery,
} from '../../api/kayttooikeus';
import { useDebounce } from '../../useDebounce';
import { KutsuView } from './KutsuViews';
import StaticUtils from '../common/StaticUtils';
import { FastMenuList, SelectOption } from '../../utilities/select';
import OphModal from '../common/modal/OphModal';

import './KutsututPage.css';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';

export type KutsututSearchParams = {
    searchTerm: string;
    organisaatioOids: string;
    tilas: string;
    view: KutsuView;
    kayttooikeusryhmaIds?: string;
    subOrganisations?: string;
};

const getDefaultView = (isAdmin?: boolean, isVirkailija?: boolean): KutsuView => {
    return isAdmin ? 'OPH' : isVirkailija ? 'KAYTTOOIKEUSRYHMA' : '';
};

export const KutsututPage = () => {
    const { L, locale } = useLocalisations();
    useTitle(L['TITLE_KUTSUTUT']);
    useNavigation(mainNavigation, false);
    const { data } = useGetOmattiedotQuery();
    const { data: ryhmat } = useGetOrganisaatioRyhmatQuery();
    const [params, setParams] = useState<KutsututSearchParams>({
        searchTerm: '',
        organisaatioOids: '',
        tilas: 'AVOIN',
        view: getDefaultView(data?.isAdmin, data?.isMiniAdmin),
        kayttooikeusryhmaIds: '',
        subOrganisations: 'true',
    });
    const delayedParams = useDebounce(params, 500);
    const [organisaatioSelection, setOrganisaatioSelection] = useState('');
    const [ryhmaSelection, setRyhmaSelection] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<KutsuRead>();
    const [deleteKutsu] = useDeleteKutsuMutation();
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({ passiiviset: false });

    const kayttooikeusryhmaOptions = useMemo(() => {
        return (
            kayttooikeusryhmat
                ?.map((kayttooikeusryhma) => ({
                    value: '' + kayttooikeusryhma.id,
                    label: StaticUtils.getLocalisedText(kayttooikeusryhma.description, locale),
                }))
                .sort((a, b) => a.label.localeCompare(b.label)) ?? []
        );
    }, [kayttooikeusryhmat]);

    async function cancelInvitationConfirmed() {
        if (confirmDelete?.id) {
            await deleteKutsu(confirmDelete.id);
            setConfirmDelete(undefined);
        }
    }

    function clearOrganisaatioSelection(): void {
        setParams({ ...params, organisaatioOids: '' });
        setOrganisaatioSelection('');
    }

    function onOrganisaatioChange(organisaatio: OrganisaatioSelectObject) {
        setParams({ ...params, organisaatioOids: organisaatio.oid });
        setOrganisaatioSelection(organisaatio.name);
        setRyhmaSelection(undefined);
    }

    function onRyhmaChange(ryhma?: SelectOption) {
        const ryhmaOid = ryhma ? ryhma.value : '';
        setParams({ ...params, organisaatioOids: ryhmaOid });
        setOrganisaatioSelection('');
        setRyhmaSelection(ryhmaOid);
    }

    function onKayttooikeusryhmaChange(kayttooikeusOption: SelectOption) {
        setParams({ ...params, kayttooikeusryhmaIds: kayttooikeusOption?.value });
    }

    const ryhmaOptions = useMemo(() => {
        return (ryhmat ?? [])
            .map((ryhma) => ({
                label: ryhma.nimi[locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                value: ryhma.oid,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [ryhmat, locale]);

    return (
        <div className="mainContent wrapper" id="kutsutut-page">
            <h2 className="oph-h2 oph-bold">{L['KUTSUTUT_VIRKAILIJAT_OTSIKKO']}</h2>
            <div className="flex-horizontal flex-align-center kutsutut-filters">
                <input
                    className="oph-input"
                    defaultValue={params.searchTerm}
                    onChange={(e) => setParams({ ...params, searchTerm: e.target.value })}
                    placeholder={L['KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO']}
                />
                <KutsututBooleanRadioButton view={params.view} setView={(view) => setParams({ ...params, view })} />
            </div>
            <div className="flex-horizontal kutsutut-filters">
                <div className="flex-item-1 flex-inline flex-column kutsutut-suodatus">
                    <div className="flex-horizontal">
                        <input
                            className="oph-input flex-item-1 kutsutut-organisaatiosuodatus"
                            type="text"
                            value={organisaatioSelection}
                            placeholder={L['KUTSUTUT_ORGANISAATIOSUODATUS']}
                            readOnly
                        />
                        <OrganisaatioSelectModal onSelect={onOrganisaatioChange} />
                        <CloseButton closeAction={() => clearOrganisaatioSelection()} />
                    </div>
                    <div className="flex-horizontal flex-inline flex-item-1">
                        <Select
                            id="kutsutut-ryhmafilter"
                            options={ryhmaOptions}
                            components={{ MenuList: FastMenuList }}
                            filterOption={createFilter({ ignoreAccents: false })}
                            value={ryhmaOptions.find((o) => o.value === ryhmaSelection)}
                            placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                            onChange={onRyhmaChange}
                            isClearable
                        />
                    </div>
                </div>
                <div className="flex-item-1 flex-inline" id="radiator">
                    <Select
                        id="kayttooikeusryhmaFilter"
                        options={kayttooikeusryhmaOptions}
                        value={kayttooikeusryhmaOptions.find((o) => o.value === params.kayttooikeusryhmaIds)}
                        placeholder={L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                        onChange={onKayttooikeusryhmaChange}
                        isClearable
                    />
                </div>
            </div>
            <KutsututTable params={delayedParams} cancelInvitation={(k) => setConfirmDelete(k)} />
            {confirmDelete && (
                <OphModal
                    onClose={() => setConfirmDelete(undefined)}
                    onOverlayClick={() => setConfirmDelete(undefined)}
                >
                    <span className="oph-h2 oph-strong">{L['PERUUTA_KUTSU_VAHVISTUS']}</span>
                    <div className="kutsu-confirmation-table">
                        <div>{L['KUTSUT_NIMI_OTSIKKO']}</div>
                        <div>
                            {confirmDelete.etunimi} {confirmDelete.sukunimi}
                        </div>
                        <div>{L['KUTSUT_SAHKOPOSTI_OTSIKKO']}</div>
                        <div>{confirmDelete.sahkoposti}</div>
                        <div>{L['KUTSUTUT_ORGANISAATIO_OTSIKKO']}</div>
                        <div>
                            {confirmDelete.organisaatiot.map((org) => (
                                <div className="kutsuOrganisaatio" key={org.organisaatioOid}>
                                    {org.nimi[locale]}
                                </div>
                            ))}
                        </div>
                        <div>{L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO']}</div>
                        <div>{moment(confirmDelete.aikaleima).format()}</div>
                    </div>
                    <Button action={cancelInvitationConfirmed}>{L['PERUUTA_KUTSU']}</Button>
                </OphModal>
            )}
        </div>
    );
};
