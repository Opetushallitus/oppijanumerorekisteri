import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction: () => void;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Hetu = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: 'HENKILO_HETU',
            value: props.henkilo.henkilo.hetu,
            inputValue: 'hetu',
            disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(Hetu);
