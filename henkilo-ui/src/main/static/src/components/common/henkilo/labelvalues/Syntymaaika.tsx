import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import type { HenkiloState } from '../../../../reducers/henkilo.reducer';
import type { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import LabelValue from './LabelValue';

type OwnProps = {
    readOnly: boolean;
    henkiloUpdate: Henkilo;
    updateDateFieldAction: () => void;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Syntymaaika = (props: Props) => {
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateDateFieldAction={props.updateDateFieldAction}
            values={{
                label: 'HENKILO_SYNTYMAAIKA',
                inputValue: 'syntymaaika',
                date: true,
                value: props.henkiloUpdate.syntymaaika,
                disabled: !!props.henkiloUpdate.hetu,
            }}
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(Syntymaaika);
