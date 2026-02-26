import React, { useId, useMemo, useState } from 'react';
import Select from 'react-select';

import {
    useDeleteIdentificationMutation,
    useGetIdentificationsQuery,
    usePostIdentificationMutation,
} from '../../api/oppijanumerorekisteri';
import { Identification } from '../../types/domain/oppijanumerorekisteri/Identification.types';
import { useLocalisations } from '../../selectors';
import { useAppDispatch } from '../../store';
import OphModal from '../common/modal/OphModal';
import { useGetHenkilontunnistetyypitQuery } from '../../api/koodisto';
import { getKoodiNimi } from '../common/StaticUtils';
import { add } from '../../slices/toastSlice';
import { selectStyles } from '../../utilities/select';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsTable } from '../design-system/OphDsTable';

type Props = {
    oid: string;
};

export const Identifications = ({ oid }: Props) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIdentifier, setNewIdentifier] = useState('');
    const [newIdpEntityId, setNewIdpEntityId] = useState('');
    const { data, isFetching } = useGetIdentificationsQuery(oid, { skip: !oid });
    const [deleteIdentification, { isLoading: isDeleteLoading }] = useDeleteIdentificationMutation();
    const [postIdentification, { isLoading: isPostLoading }] = usePostIdentificationMutation();
    const { data: tunnistetyypit, isLoading: isTunnistetyypitLoading } = useGetHenkilontunnistetyypitQuery();
    const henkilotunnisteetSectionLabel = useId();

    const getTunnisteLabel = (t: string) => (tunnistetyypit ? `${getKoodiNimi(t, tunnistetyypit, locale)} (${t})` : t);

    const removeIdentification = (identification: Identification) => {
        deleteIdentification({ oid, identification })
            .unwrap()
            .catch(() => {
                dispatch(
                    add({
                        id: `REMOVE_SAHKOPOSTITUNNISTEET-${Math.random()}`,
                        type: 'error',
                        header: L('SAHKOPOSTITUNNISTE_POISTO_VIRHE'),
                    })
                );
            });
    };

    const addIdentification = () => {
        postIdentification({ oid, identification: { identifier: newIdentifier, idpEntityId: newIdpEntityId } })
            .unwrap()
            .then(() => {
                setNewIdentifier('');
                setNewIdpEntityId('');
                setShowAddModal(false);
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `SAVE_SAHKOPOSTITUNNISTEET-${Math.random()}`,
                        type: 'error',
                        header: L('SAHKOPOSTITUNNISTE_TALLENNUS_VIRHE'),
                    })
                );
            });
    };

    const idpEntityIdOptions = useMemo(() => {
        const options =
            tunnistetyypit
                ?.filter((t) => t.koodiUri !== 'henkilontunnistetyypit_eidas')
                ?.map((t) => ({
                    value: t.koodiArvo,
                    label: getTunnisteLabel(t.koodiArvo),
                })) ?? [];
        return options.sort((a, b) => (a.label.toLocaleLowerCase() < b.label.toLocaleLowerCase() ? -1 : 1));
    }, [tunnistetyypit]);

    return (
        <section aria-labelledby={henkilotunnisteetSectionLabel} className="henkiloViewUserContentWrapper">
            <h2 id={henkilotunnisteetSectionLabel}>{L('TUNNISTEET_OTSIKKO')}</h2>
            <div id="identifications" style={{ wordBreak: 'break-word' }}>
                {data && data.length > 0 && (
                    <div style={{ maxWidth: '1080px' }}>
                        <OphDsTable
                            headers={[L('TUNNISTEET_IDENTIFIER'), L('TUNNISTEET_IDPENTITYID'), '']}
                            isFetching={isFetching}
                            rows={(data ?? []).map((d) => [
                                <span key={`id-${d.identifier}`}>{d.identifier}</span>,
                                <span key={`entity-${d.identifier}`}>{d.idpEntityId}</span>,
                                <div key={`button-${d.identifier}`} style={{ textAlign: 'right' }}>
                                    <button
                                        className="oph-ds-button oph-ds-button-bordered oph-ds-button-icon oph-ds-icon-button-delete"
                                        onClick={() => removeIdentification(d)}
                                        disabled={isDeleteLoading}
                                        data-test-id="identification-remove-button"
                                    >
                                        {L('TUNNISTEET_POISTA')}
                                    </button>
                                </div>,
                            ])}
                        />
                    </div>
                )}
                <button
                    className="oph-ds-button"
                    onClick={() => setShowAddModal(true)}
                    disabled={isTunnistetyypitLoading}
                    data-test-id="identification-add-button"
                >
                    {L('TUNNISTEET_LISAA')}
                </button>
                {showAddModal && (
                    <OphModal title={L('TUNNISTEET_LISAA')} onClose={() => setShowAddModal(false)}>
                        <OphDsInput
                            id="newIdentifier"
                            label={L('TUNNISTEET_IDENTIFIER')}
                            defaultValue={newIdentifier}
                            onChange={setNewIdentifier}
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <label htmlFor="newIdentifier">{L('TUNNISTEET_IDPENTITYID')}</label>
                            <Select
                                {...selectStyles}
                                inputId="newIdpEntityId"
                                options={idpEntityIdOptions}
                                onChange={(option) => setNewIdpEntityId(option?.value ?? '')}
                                value={idpEntityIdOptions.find((o) => o.value === newIdpEntityId)}
                            />
                        </div>
                        <button
                            className="oph-ds-button"
                            onClick={() => addIdentification()}
                            disabled={!newIdentifier || !newIdpEntityId || isPostLoading}
                            style={{ marginTop: '1rem' }}
                            data-test-id="identification-confirm-add"
                        >
                            {L('TUNNISTEET_LISAA')}
                        </button>
                    </OphModal>
                )}
            </div>
        </section>
    );
};
