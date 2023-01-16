import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { fetchTuontidata } from '../../actions/tuontidata.actions';
import OphModal from '../common/modal/OphModal';
import Table from '../common/table/Table';
import type { RootState } from '../../reducers';
import type { Tuontidata } from '../../types/tuontidata.types';

type OwnProps = {
    tuontiId: number;
    translate: (key: string) => string;
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

const TuontiDetails: React.FC<Props> = ({ tuontiId, translate, onClose, fetchData, tuontidata, loading }) => {
    React.useEffect(() => {
        fetchData(tuontiId);
    }, [fetchData, tuontiId]);

    const headings = [
        { key: 'tunniste', label: translate('TUONTI_TUNNISTE') },
        {
            key: 'henkiloOid',
            label: translate('HENKILO_OID'),
            Cell: (cellProps) => (
                <Link to={`/oppija/${cellProps.value}`} target="_blank">
                    {cellProps.value}
                </Link>
            ),
        },
    ];

    return (
        <OphModal onClose={onClose}>
            <Table
                headings={headings}
                noDataText={translate('TUONTIDATA_EI_KONFLIKTEJA')}
                data={(tuontidata || []).filter((row) => row.conflict)}
                striped
                resizable
                highlight
                pageSize={20}
                translate={translate}
                isLoading={loading}
                subComponent={(row) => <pre>{JSON.stringify(row.original.henkilo, undefined, 4)}</pre>}
            />
        </OphModal>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    tuontidata: state.tuontidata.payload,
    loading: state.tuontidata.loading,
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapStateToProps, {
    fetchData: fetchTuontidata,
})(TuontiDetails);
