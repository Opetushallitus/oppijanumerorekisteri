import React, { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import OphTable from '../OphTable';
import {
    useDeleteIdentificationMutation,
    useGetIdentificationsQuery,
    usePostIdentificationMutation,
} from '../../api/oppijanumerorekisteri';
import { Identification } from '../../types/domain/oppijanumerorekisteri/Identification.types';
import { useLocalisations } from '../../selectors';
import Button from '../common/button/Button';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { useAppDispatch } from '../../store';
import { addGlobalNotification } from '../../actions/notification.actions';
import OphModal from '../common/modal/OphModal';
import OphSelect from '../common/select/OphSelect';
import { useGetHenkilontunnistetyypitQuery } from '../../api/koodisto';
import StaticUtils from '../common/StaticUtils';
import Loader from '../common/icons/Loader';

type Props = {
    oid?: string;
};

export const Identifications = ({ oid }: Props) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIdentifier, setNewIdentifier] = useState('');
    const [newIdpEntityId, setNewIdpEntityId] = useState('');
    const { data, isLoading, isFetching } = useGetIdentificationsQuery(oid, { skip: !!oid });
    const [deleteIdentification, { isLoading: isDeleteLoading }] = useDeleteIdentificationMutation();
    const [postIdentification, { isLoading: isPostLoading }] = usePostIdentificationMutation();
    const { data: tunnistetyypit, isLoading: isTunnistetyypitLoading } = useGetHenkilontunnistetyypitQuery();

    const getTunnisteLabel = (t: string) =>
        tunnistetyypit ? `${StaticUtils.getKoodiNimi(t, tunnistetyypit, locale)} (${t})` : t;

    const removeIdentification = (identification: Identification) => {
        deleteIdentification({ oid, identification })
            .unwrap()
            .catch(() => {
                dispatch(
                    addGlobalNotification({
                        key: 'REMOVE_SAHKOPOSTITUNNISTEET',
                        type: NOTIFICATIONTYPES.ERROR,
                        autoClose: 10000,
                        title: L['SAHKOPOSTITUNNISTE_POISTO_VIRHE'],
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
                    addGlobalNotification({
                        key: 'SAVE_SAHKOPOSTITUNNISTEET',
                        type: NOTIFICATIONTYPES.ERROR,
                        autoClose: 10000,
                        title: L['SAHKOPOSTITUNNISTE_TALLENNUS_VIRHE'],
                    })
                );
            });
    };

    const columns = useMemo<ColumnDef<Identification, Identification>[]>(
        () => [
            {
                id: 'identifier',
                header: () => L['TUNNISTEET_IDENTIFIER'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => getValue().identifier,
            },
            {
                id: 'idpEntityId',
                header: () => L['TUNNISTEET_IDPENTITYID'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => getTunnisteLabel(getValue().idpEntityId),
            },
            {
                id: 'buttons',
                header: () => '',
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <Button
                        action={() => removeIdentification(getValue())}
                        disabled={isDeleteLoading}
                        dataTestId="identification-remove-button"
                    >
                        {L['TUNNISTEET_POISTA']}
                    </Button>
                ),
            },
        ],
        [data]
    );

    const table = useReactTable({
        columns,
        pageCount: 1,
        data,
        enableSorting: false,
        getCoreRowModel: getCoreRowModel(),
    });

    const idpEntityIdOptions = useMemo(() => {
        const options =
            tunnistetyypit?.map((t) => ({
                value: t.koodiArvo,
                label: getTunnisteLabel(t.koodiArvo),
            })) ?? [];
        return options.sort((a, b) => (a.label.toLocaleLowerCase() < b.label.toLocaleLowerCase() ? -1 : 1));
    }, [tunnistetyypit]);

    return (
        <div id="identifications" style={{ wordBreak: 'break-word' }}>
            {data?.length > 0 && <OphTable table={table} isLoading={isLoading} />}
            {(isPostLoading || isDeleteLoading || isFetching || isLoading) && <Loader />}
            <Button
                action={() => setShowAddModal(true)}
                disabled={isTunnistetyypitLoading}
                style={{ marginTop: '1rem' }}
                dataTestId="identification-add-button"
            >
                {L['TUNNISTEET_LISAA']}
            </Button>
            {showAddModal && (
                <OphModal title={L['TUNNISTEET_LISAA']} onClose={() => setShowAddModal(false)}>
                    <>
                        <div style={{ marginTop: '1rem' }}>
                            <label htmlFor="newIdentifier">{L['TUNNISTEET_IDENTIFIER']}</label>
                            <input
                                id="newIdentifier"
                                className="oph-input"
                                value={newIdentifier}
                                onChange={(e) => setNewIdentifier(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <label htmlFor="newIdentifier">{L['TUNNISTEET_IDPENTITYID']}</label>
                            <OphSelect
                                id="newIdpEntityId"
                                options={idpEntityIdOptions}
                                onChange={(option) => setNewIdpEntityId(option.value)}
                                value={newIdpEntityId}
                            />
                        </div>
                        <Button
                            action={() => addIdentification()}
                            disabled={!newIdentifier || !newIdpEntityId || isPostLoading}
                            style={{ marginTop: '1rem' }}
                            dataTestId="identification-confirm-add"
                        >
                            {L['TUNNISTEET_LISAA']}
                        </Button>
                    </>
                </OphModal>
            )}
        </div>
    );
};
