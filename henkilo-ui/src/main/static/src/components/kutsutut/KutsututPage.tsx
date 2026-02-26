import React, { useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { format, parseISO } from 'date-fns';

import KutsututTable from './KutsututTable';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { useLocalisations } from '../../selectors';
import {
    useDeleteKutsuMutation,
    useGetKayttooikeusryhmasQuery,
    useGetOmattiedotQuery,
    useGetOrganisaatioRyhmatQuery,
} from '../../api/kayttooikeus';
import { useDebounce } from '../../useDebounce';
import { KutsuView } from './KutsuViews';
import { getLocalisedText } from '../common/StaticUtils';
import { SelectOption, selectProps } from '../../utilities/select';
import OphModal from '../common/modal/OphModal';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsRadioGroup } from '../design-system/OphDsRadioGroup';

import './KutsututPage.css';

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
    useTitle(L('TITLE_KUTSUTUT'));
    useNavigation(mainNavigation, false);
    const { data } = useGetOmattiedotQuery();
    const { data: omattiedot } = useGetOmattiedotQuery();
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
    const [ryhmaSelection, setRyhmaSelection] = useState<string | undefined>('');
    const [organisaatioSelection, setOrganisaatioSelection] = useState<string | undefined>('');
    const [confirmDelete, setConfirmDelete] = useState<KutsuRead>();
    const [deleteKutsu] = useDeleteKutsuMutation();
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({ passiiviset: false });

    const kayttooikeusryhmaOptions = useMemo(() => {
        return (
            kayttooikeusryhmat
                ?.map((kayttooikeusryhma) => ({
                    value: '' + kayttooikeusryhma.id,
                    label: getLocalisedText(kayttooikeusryhma.description, locale) ?? String(kayttooikeusryhma.id),
                }))
                .sort((a, b) => (a.label && b.label ? a.label.localeCompare(b.label) : 1)) ?? []
        );
    }, [kayttooikeusryhmat]);

    async function cancelInvitationConfirmed() {
        if (confirmDelete?.id) {
            await deleteKutsu(confirmDelete.id);
            setConfirmDelete(undefined);
        }
    }

    function onOrganisaatioChange(organisaatio: SingleValue<OrganisaatioSelectObject>) {
        setParams({ ...params, organisaatioOids: organisaatio?.oid ?? '' });
        setOrganisaatioSelection(organisaatio?.oid);
        setRyhmaSelection(undefined);
    }

    function onRyhmaChange(ryhma?: SingleValue<SelectOption>) {
        const ryhmaOid = ryhma ? ryhma.value : '';
        setParams({ ...params, organisaatioOids: ryhmaOid });
        setOrganisaatioSelection(undefined);
        setRyhmaSelection(ryhmaOid);
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
        <div className="mainContent wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1>{L('KUTSUTUT_VIRKAILIJAT_OTSIKKO')}</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <OphDsInput
                    id="henkilo"
                    label={L('KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO')}
                    defaultValue={params.searchTerm}
                    onChange={(s) => setParams({ ...params, searchTerm: s })}
                />
                {omattiedot?.isAdmin ? (
                    <OphDsRadioGroup<KutsuView>
                        checked={params.view}
                        groupName="filter-kutsut"
                        legend=""
                        onChange={(v) => setParams({ ...params, view: v })}
                        radios={[
                            { id: 'OPH', value: 'OPH', label: L('KUTSUTUT_OPH_BUTTON') },
                            { id: 'KAIKKI', value: '', label: L('KUTSUTUT_KAIKKI_BUTTON') },
                        ]}
                    />
                ) : omattiedot?.isMiniAdmin ? (
                    <OphDsRadioGroup<KutsuView>
                        checked={params.view}
                        groupName="filter-kutsut"
                        legend=""
                        onChange={(v) => setParams({ ...params, view: v })}
                        radios={[
                            {
                                id: 'KAYTTOOIKEUSRYHMA',
                                value: 'KAYTTOOIKEUSRYHMA',
                                label: L('KUTSUTUT_OMA_KAYTTOOIKEUSRYHMA_BUTTON'),
                            },
                            { id: 'OMA', value: '', label: L('KUTSUTUT_OMA_ORGANISAATIO_BUTTON') },
                        ]}
                    />
                ) : (
                    ''
                )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <OphDsOrganisaatioSelect disabled={!!ryhmaSelection} onChange={onOrganisaatioChange} />
                <Select
                    {...selectProps}
                    id="kayttooikeusryhmaFilter"
                    options={kayttooikeusryhmaOptions}
                    value={kayttooikeusryhmaOptions.find((o) => o.value === params.kayttooikeusryhmaIds)}
                    placeholder={L('HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER')}
                    onChange={(k) => setParams({ ...params, kayttooikeusryhmaIds: k?.value ?? '' })}
                    isClearable
                />
                <Select
                    {...selectProps}
                    id="kutsutut-ryhmafilter"
                    isDisabled={!!organisaatioSelection}
                    options={ryhmaOptions}
                    value={ryhmaOptions.find((o) => o.value === ryhmaSelection)}
                    placeholder={L('HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA')}
                    onChange={onRyhmaChange}
                    isClearable
                />
            </div>
            <KutsututTable params={delayedParams} cancelInvitation={(k) => setConfirmDelete(k)} />
            {confirmDelete && (
                <OphModal
                    title={L('PERUUTA_KUTSU_VAHVISTUS')}
                    onClose={() => setConfirmDelete(undefined)}
                    onOverlayClick={() => setConfirmDelete(undefined)}
                >
                    <div className="kutsu-confirmation-table">
                        <div>{L('KUTSUT_NIMI_OTSIKKO')}</div>
                        <div>
                            {confirmDelete.etunimi} {confirmDelete.sukunimi}
                        </div>
                        <div>{L('KUTSUT_SAHKOPOSTI_OTSIKKO')}</div>
                        <div>{confirmDelete.sahkoposti}</div>
                        <div>{L('KUTSUTUT_ORGANISAATIO_OTSIKKO')}</div>
                        <div>
                            {confirmDelete.organisaatiot.map((org) => (
                                <div className="kutsuOrganisaatio" key={org.organisaatioOid}>
                                    {org.nimi[locale]}
                                </div>
                            ))}
                        </div>
                        <div>{L('KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO')}</div>
                        <div>{format(parseISO(confirmDelete.aikaleima), 'd.M.yyyy')}</div>
                    </div>
                    <button className="oph-ds-button" onClick={cancelInvitationConfirmed}>
                        {L('PERUUTA_KUTSU')}
                    </button>
                </OphModal>
            )}
        </div>
    );
};
