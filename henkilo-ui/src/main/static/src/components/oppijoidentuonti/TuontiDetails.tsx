import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { fetchTuontidata } from '../../actions/tuontidata.actions';
import OphModal from '../common/modal/OphModal';
import Table from '../common/table/Table';
import OphCheckboxButtonInput from '../common/forms/OphCheckboxButtonInput';
import Button from '../common/button/Button';
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
    const [showAll, setShowAll] = React.useState<boolean>(true);

    const headings = [
        { key: 'tunniste', label: translate('TUONTIDATA_TUNNISTE') },
        {
            key: 'henkiloNimi',
            label: translate('OPPIJOIDEN_TUONTI_NIMI'),
            Cell: (cellProps) => (
                <Link to={`/oppija/${cellProps.original.henkiloOid}`} target="_blank">
                    {cellProps.value}
                </Link>
            ),
        },
        {
            key: 'conflict',
            label: translate('TUONTIDATA_VIRHE'),
            Cell: (cellprops) => cellprops.value && <i className="fa fa-check" />,
        },
    ];

    return (
        <OphModal onClose={onClose}>
            <OphCheckboxButtonInput
                value="errors"
                idName="filter"
                checked={!showAll}
                label={translate('TUONTIDATA_VAIN_VIRHEET')}
                action={() => setShowAll(!showAll)}
            />
            <Table
                headings={headings}
                noDataText={translate('TUONTIDATA_EI_KONFLIKTEJA')}
                data={(tuontidata || []).filter((row) => showAll || row.conflict)}
                striped
                resizable
                highlight
                pageSize={20}
                translate={translate}
                isLoading={loading}
                subComponent={(row) => <pre>{JSON.stringify(row.original.henkilo, undefined, 4)}</pre>}
            />
            <Button action={onClose}>{translate('TUONTIDATA_SULJE')}</Button>
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
