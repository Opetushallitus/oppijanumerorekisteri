import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction?: () => void;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Etunimet = (props: Props) => (
    <LabelValue
        updateModelFieldAction={props.updateModelFieldAction}
        readOnly={props.readOnly}
        values={{
            label: 'HENKILO_ETUNIMET',
            value: props.henkilo.henkilo.etunimet,
            inputValue: 'etunimet',
            disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps>(mapStateToProps)(Etunimet);
