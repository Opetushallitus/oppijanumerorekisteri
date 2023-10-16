import React, { useState } from 'react';
import moment from 'moment';
import Modal from '../common/modal/Modal';
import Button from '../common/button/Button';
import './KutsututPage.css';
import KutsututTable from './KutsututTable';
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput';
import KutsututBooleanRadioButton from './KutsututBooleanRadioButton';
import KayttooikeusryhmaSingleSelect from '../common/select/KayttooikeusryhmaSingleSelect';
import { deleteKutsu } from '../../actions/kutsu.actions';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import CloseButton from '../common/button/CloseButton';
import { Option } from 'react-select';
import { useLocalisations } from '../../selectors';
import { RootState, useAppDispatch } from '../../store';
import { useSelector } from 'react-redux';

export type Payload = {
    searchTerm: string;
    organisaatioOids: string;
    tilas: Array<string>;
    view?: string;
    kayttooikeusryhmaIds?: string;
    subOrganisations?: boolean;
};

export const KutsututPage = () => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [payload, setPayload] = useState<Payload>({
        searchTerm: '',
        organisaatioOids: '',
        tilas: ['AVOIN'],
        view: null,
        kayttooikeusryhmaIds: null,
        subOrganisations: true,
    });
    const [organisaatioSelection, setOrganisaatioSelection] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<KutsuRead>();
    const isKutsusLoaded = useSelector<RootState, boolean>((state) => state.kutsuList.loaded);

    async function cancelInvitationConfirmed() {
        if (confirmDelete?.id) {
            await dispatch<any>(deleteKutsu(confirmDelete.id));
            setConfirmDelete(undefined);
        }
    }

    function clearOrganisaatioSelection(): void {
        setPayload({ ...payload, organisaatioOids: '' });
        setOrganisaatioSelection('');
    }

    function onOrganisaatioChange(organisaatio: OrganisaatioSelectObject) {
        setPayload({ ...payload, organisaatioOids: organisaatio.oid });
        setOrganisaatioSelection(organisaatio.name);
    }

    function onKayttooikeusryhmaChange(kayttooikeusOption: Option<string>) {
        setPayload({ ...payload, kayttooikeusryhmaIds: kayttooikeusOption.value });
    }

    return (
        <div className="wrapper" id="kutsutut-page">
            <div className="header">
                <span className="oph-h2 oph-bold">{L['KUTSUTUT_VIRKAILIJAT_OTSIKKO']}</span>
                <span className="right">
                    <KutsututBooleanRadioButton
                        view={payload.view}
                        setView={(view) => setPayload({ ...payload, view })}
                    />
                </span>
            </div>
            <div className="flex-horizontal flex-align-center kutsutut-filters">
                <div className="flex-item-1">
                    <DelayedSearchInput
                        setSearchQueryAction={(searchTerm) => setPayload({ ...payload, searchTerm })}
                        defaultNameQuery={payload.searchTerm}
                        placeholder={L['KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO']}
                        loading={!isKutsusLoaded}
                    />
                </div>
            </div>
            <div className="flex-horizontal kutsutut-filters">
                <div className="flex-item-1 flex-inline">
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
                <div className="flex-item-1 flex-inline" id="radiator">
                    <div className="flex-item-1">
                        <KayttooikeusryhmaSingleSelect
                            kayttooikeusSelection={payload.kayttooikeusryhmaIds}
                            kayttooikeusSelectionAction={onKayttooikeusryhmaChange}
                        />
                    </div>
                    <CloseButton
                        closeAction={() => setPayload({ ...payload, kayttooikeusryhmaIds: undefined })}
                    ></CloseButton>
                </div>
            </div>
            <KutsututTable payload={payload} cancelInvitation={(k) => setConfirmDelete(k)} />
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
