import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';

import OphModal from '../common/modal/OphModal';
import OphCheckboxButtonInput from '../common/forms/OphCheckboxButtonInput';
import { useLocalisations } from '../../selectors';
import { useGetTuontidataQuery } from '../../api/oppijanumerorekisteri';
import OphTable, { expanderColumn } from '../OphTable';
import { Tuontidata } from '../../types/tuontidata.types';

type OwnProps = {
    tuontiId: number;
    onClose: () => void;
};

const emptyData: Tuontidata[] = [];
const emptyColumns: ColumnDef<Tuontidata>[] = [];

const TuontiDetails = ({ tuontiId, onClose }: OwnProps) => {
    const { L } = useLocalisations();
    const { data, isFetching } = useGetTuontidataQuery({ tuontiId, L });
    const [showAll, setShowAll] = useState(true);

    const columns = useMemo<ColumnDef<Tuontidata, Tuontidata>[]>(
        () => [
            expanderColumn(),
            { accessorFn: (row) => row.tunniste, header: () => L['TUONTIDATA_TUNNISTE'], id: 'tunniste' },
            {
                accessorFn: (row) => row,
                header: () => L['OPPIJOIDEN_TUONTI_NIMI'],
                cell: ({ getValue }) => (
                    <Link to={`/oppija/${getValue().henkiloOid}`} target="_blank">
                        {getValue().henkiloNimi}
                    </Link>
                ),
                id: 'henkilonNimi',
            },
            {
                accessorFn: (row) => row,
                header: () => L['TUONTIDATA_VIRHE'],
                cell: ({ getValue }) => getValue().conflict && <i className="fa fa-check" />,
                id: 'conflict',
            },
        ],
        [data]
    );

    const memoizedData = useMemo(() => {
        const renderedData = data?.filter((row) => showAll || row.conflict);
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [data]);

    const table = useReactTable({
        data: memoizedData ?? emptyData,
        columns: columns ?? emptyColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowCanExpand: () => true,
    });

    return (
        <OphModal onClose={onClose}>
            <OphCheckboxButtonInput
                value="errors"
                idName="filter"
                checked={!showAll}
                label={L['TUONTIDATA_VAIN_VIRHEET']!}
                action={() => setShowAll(!showAll)}
            />
            <OphTable<Tuontidata>
                table={table}
                isLoading={isFetching}
                renderSubComponent={({ row }) => <pre>{JSON.stringify(row.original.henkilo, undefined, 4)}</pre>}
            />
        </OphModal>
    );
};

export default TuontiDetails;
