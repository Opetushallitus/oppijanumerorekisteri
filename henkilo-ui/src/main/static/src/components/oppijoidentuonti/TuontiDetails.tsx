import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { fetchTuontidata } from '../../actions/tuontidata.actions';
import OphModal from '../common/modal/OphModal';
import Table from '../common/table/Table';
import OphCheckboxButtonInput from '../common/forms/OphCheckboxButtonInput';
import Button from '../common/button/Button';
import type { RootState } from '../../store';
import type { Tuontidata } from '../../types/tuontidata.types';
import { useLocalisations } from '../../selectors';

type OwnProps = {
    tuontiId: number;
    onClose: () => void;
};

type StateProps = {
    tuontidata?: Tuontidata[];
    loading: boolean;
};

type DispatchProps = {
    fetchData: (tuontiId: number) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const TuontiDetails: React.FC<Props> = ({ tuontiId, onClose, fetchData, tuontidata, loading }) => {
    React.useEffect(() => {
        fetchData(tuontiId);
    }, [fetchData, tuontiId]);
    const [showAll, setShowAll] = React.useState<boolean>(true);
    const { L } = useLocalisations();

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
                data={(tuontidata || []).filter((row) => showAll || row.conflict)}
                striped
                resizable
                highlight
                pageSize={20}
                isLoading={loading}
                subComponent={(row) => <pre>{JSON.stringify(row.original.henkilo, undefined, 4)}</pre>}
            />
            <Button action={onClose}>{L['TUONTIDATA_SULJE']}</Button>
        </OphModal>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    tuontidata: state.tuontidata.payload,
    loading: state.tuontidata.loading,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchData: fetchTuontidata,
})(TuontiDetails);
