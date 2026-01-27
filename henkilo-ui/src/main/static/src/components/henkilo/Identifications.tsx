import React, { useId, useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Select from 'react-select';

import OphTable from '../OphTable';
import {
    useDeleteIdentificationMutation,
    useGetIdentificationsQuery,
    usePostIdentificationMutation,
} from '../../api/oppijanumerorekisteri';
import { Identification } from '../../types/domain/oppijanumerorekisteri/Identification.types';
import { useLocalisations } from '../../selectors';
import Button from '../common/button/Button';
import { useAppDispatch } from '../../store';
import OphModal from '../common/modal/OphModal';
import { useGetHenkilontunnistetyypitQuery } from '../../api/koodisto';
import StaticUtils from '../common/StaticUtils';
import { add } from '../../slices/toastSlice';

type Props = {
    oid: string;
};

const emptyData: Identification[] = [];
const emptyColumns: ColumnDef<Identification>[] = [];

export const Identifications = ({ oid }: Props) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIdentifier, setNewIdentifier] = useState('');
    const [newIdpEntityId, setNewIdpEntityId] = useState('');
    const { data, isLoading, isFetching } = useGetIdentificationsQuery(oid, { skip: !oid });
    const [deleteIdentification, { isLoading: isDeleteLoading }] = useDeleteIdentificationMutation();
    const [postIdentification, { isLoading: isPostLoading }] = usePostIdentificationMutation();
    const { data: tunnistetyypit, isLoading: isTunnistetyypitLoading } = useGetHenkilontunnistetyypitQuery();
    const henkilotunnisteetSectionLabel = useId();

    const getTunnisteLabel = (t: string) =>
        tunnistetyypit ? `${StaticUtils.getKoodiNimi(t, tunnistetyypit, locale)} (${t})` : t;

    const removeIdentification = (identification: Identification) => {
        deleteIdentification({ oid, identification })
            .unwrap()
            .catch(() => {
                dispatch(
                    add({
                        id: `REMOVE_SAHKOPOSTITUNNISTEET-${Math.random()}`,
                        type: 'error',
                        header: L['SAHKOPOSTITUNNISTE_POISTO_VIRHE'],
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
                        header: L['SAHKOPOSTITUNNISTE_TALLENNUS_VIRHE'],
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

    const memoizedData = useMemo(() => {
        const renderedData = data;
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [data]);

    const table = useReactTable({
        columns: columns ?? emptyColumns,
        pageCount: 1,
        data: memoizedData ?? emptyData,
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
        <section aria-labelledby={henkilotunnisteetSectionLabel} className="henkiloViewUserContentWrapper">
            <h2 id={henkilotunnisteetSectionLabel}>{L['TUNNISTEET_OTSIKKO']}</h2>
            <div id="identifications" style={{ wordBreak: 'break-word' }}>
                {data && data.length > 0 && (
                    <OphTable table={table} isLoading={isPostLoading || isDeleteLoading || isFetching || isLoading} />
                )}
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
                                <Select
                                    inputId="newIdpEntityId"
                                    options={idpEntityIdOptions}
                                    onChange={(option) => setNewIdpEntityId(option?.value ?? '')}
                                    value={idpEntityIdOptions.find((o) => o.value === newIdpEntityId)}
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
        </section>
    );
};
