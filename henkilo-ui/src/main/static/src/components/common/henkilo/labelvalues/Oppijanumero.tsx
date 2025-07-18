import React, { SyntheticEvent } from 'react';
import type { RootState } from '../../../../store';
import { connect } from 'react-redux';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Oppijanumero = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: 'HENKILO_OPPIJANUMERO',
            value: props.henkilo.master.oppijanumero || props.henkilo.henkilo.oppijanumero,
            inputValue: 'oppijanumero',
            readOnly: true,
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Oppijanumero);
