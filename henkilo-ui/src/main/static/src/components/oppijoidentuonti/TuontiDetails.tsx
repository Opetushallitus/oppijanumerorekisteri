import React from 'react';
import { Link } from 'react-router';

import OphModal from '../common/modal/OphModal';
import Table from '../common/table/Table';
import OphCheckboxButtonInput from '../common/forms/OphCheckboxButtonInput';
import Button from '../common/button/Button';
import { useLocalisations } from '../../selectors';
import { useGetTuontidataQuery } from '../../api/oppijanumerorekisteri';

type OwnProps = {
    tuontiId: number;
    onClose: () => void;
};

const TuontiDetails = ({ tuontiId, onClose }: OwnProps) => {
    const { L } = useLocalisations();
    const { data, isFetching } = useGetTuontidataQuery({ tuontiId, L });
    const [showAll, setShowAll] = React.useState<boolean>(true);

    const headings = [
        { key: 'tunniste', label: L['TUONTIDATA_TUNNISTE'] },
        {
            key: 'henkiloNimi',
            label: L['OPPIJOIDEN_TUONTI_NIMI'],
            Cell: (cellProps) => (
                <Link to={`/oppija/${cellProps.original.henkiloOid}`} target="_blank">
                    {cellProps.value}
                </Link>
            ),
        },
        {
            key: 'conflict',
            label: L['TUONTIDATA_VIRHE'],
            Cell: (cellprops) => cellprops.value && <i className="fa fa-check" />,
        },
    ];

    return (
        <OphModal onClose={onClose}>
            <OphCheckboxButtonInput
                value="errors"
                idName="filter"
                checked={!showAll}
                label={L['TUONTIDATA_VAIN_VIRHEET']}
                action={() => setShowAll(!showAll)}
            />
            <Table
                headings={headings}
                noDataText={L['TUONTIDATA_EI_KONFLIKTEJA']}
                data={(data || []).filter((row) => showAll || row.conflict)}
                striped
                resizable
                highlight
                pageSize={20}
                isLoading={isFetching}
                subComponent={(row) => <pre>{JSON.stringify(row.original.henkilo, undefined, 4)}</pre>}
            />
            <Button action={onClose}>{L['TUONTIDATA_SULJE']}</Button>
        </OphModal>
    );
};

export default TuontiDetails;
