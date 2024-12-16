import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Option } from 'react-select';

import Modal from '../common/modal/Modal';
import Button from '../common/button/Button';
import './KutsututPage.css';
import KutsututTable from './KutsututTable';
import KutsututBooleanRadioButton from './KutsututBooleanRadioButton';
import KayttooikeusryhmaSingleSelect from '../common/select/KayttooikeusryhmaSingleSelect';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import CloseButton from '../common/button/CloseButton';
import { useLocalisations } from '../../selectors';
import { useDeleteKutsuMutation, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useDebounce } from '../../useDebounce';
import { KutsuView } from './KutsuViews';
import OphSelect from '../common/select/OphSelect';
import { parseRyhmaOptions } from '../../utilities/organisaatio.util';
import { RootState, useAppDispatch } from '../../store';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import { fetchAllRyhmas } from '../../actions/organisaatio.actions';

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
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const { data } = useGetOmattiedotQuery();
    const [params, setParams] = useState<KutsututSearchParams>({
        searchTerm: '',
        organisaatioOids: '',
        tilas: 'AVOIN',
        view: getDefaultView(data?.isAdmin, data?.isMiniAdmin),
        kayttooikeusryhmaIds: '',
        subOrganisations: 'true',
    });
    const ryhmat = useSelector<RootState, RyhmatState>((state) => state.ryhmatState);
    const delayedParams = useDebounce(params, 500);
    const [organisaatioSelection, setOrganisaatioSelection] = useState('');
    const [ryhmaSelection, setRyhmaSelection] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<KutsuRead>();
    const [deleteKutsu] = useDeleteKutsuMutation();

    useEffect(() => {
        dispatch<any>(fetchAllRyhmas());
    }, []);

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

    function onRyhmaChange(ryhma?: Option<string>) {
        const ryhmaOid = ryhma ? ryhma.value : '';
        setParams({ ...params, organisaatioOids: ryhmaOid });
        setOrganisaatioSelection('');
        setRyhmaSelection(ryhmaOid);
    }

    function onKayttooikeusryhmaChange(kayttooikeusOption: Option<string>) {
        setParams({ ...params, kayttooikeusryhmaIds: kayttooikeusOption.value });
    }

    return (
        <div className="wrapper" id="kutsutut-page">
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
                        <CloseButton closeAction={() => clearOrganisaatioSelection()}></CloseButton>
                    </div>
                    <div className="flex-horizontal flex-inline flex-item-1">
                        <span className="flex-item-1 kutsutut-ryhmasuodatus">
                            <OphSelect
                                id="ryhmafilter"
                                options={parseRyhmaOptions(ryhmat, locale)}
                                value={ryhmaSelection}
                                placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                                onChange={onRyhmaChange}
                                maxHeight={400}
                            />
                        </span>
                        <span>
                            <CloseButton closeAction={() => onRyhmaChange(undefined)} />
                        </span>
                    </div>
                </div>
                <div className="flex-item-1 flex-inline" id="radiator">
                    <div className="flex-item-1">
                        <KayttooikeusryhmaSingleSelect
                            kayttooikeusSelection={params.kayttooikeusryhmaIds}
                            kayttooikeusSelectionAction={onKayttooikeusryhmaChange}
                        />
                    </div>
                    <CloseButton
                        closeAction={() => setParams({ ...params, kayttooikeusryhmaIds: undefined })}
                    ></CloseButton>
                </div>
            </div>
            <KutsututTable params={delayedParams} cancelInvitation={(k) => setConfirmDelete(k)} />
            {confirmDelete && (
                <Modal show={!!confirmDelete} onClose={() => setConfirmDelete(undefined)} closeOnOuterClick={true}>
                    <div className="confirmation-modal">
                        <span className="oph-h2 oph-strong">{L['PERUUTA_KUTSU_VAHVISTUS']}</span>
                        <table>
                            <tbody>
                                <tr>
                                    <th>{L['KUTSUT_NIMI_OTSIKKO']}</th>
                                    <td>
                                        {confirmDelete.etunimi} {confirmDelete.sukunimi}
                                    </td>
                                </tr>
                                <tr>
                                    <th>{L['KUTSUT_SAHKOPOSTI_OTSIKKO']}</th>
                                    <td>{confirmDelete.sahkoposti}</td>
                                </tr>
                                <tr>
                                    <th>{L['KUTSUTUT_ORGANISAATIO_OTSIKKO']}</th>
                                    <td>
                                        {confirmDelete.organisaatiot.map((org) => (
                                            <div className="kutsuOrganisaatio" key={org.organisaatioOid}>
                                                {org.nimi[locale]}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                                <tr>
                                    <th>{L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO']}</th>
                                    <td>{moment(confirmDelete.aikaleima).format()}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="row">
                            <Button className="left action" action={cancelInvitationConfirmed}>
                                {L['PERUUTA_KUTSU']}
                            </Button>
                            <Button className="right cancel" action={() => setConfirmDelete(undefined)}>
                                {L['PERUUTA_KUTSUN_PERUUTTAMINEN']}
                            </Button>
                        </div>
                        <div className="clear" />
                    </div>
                </Modal>
            )}
        </div>
    );
};
