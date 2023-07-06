import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    autofocus?: boolean;
    updateModelFieldAction?: () => void;
    label?: string;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Sukunimi = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        autofocus={props.autofocus}
        values={{
            label: props.label || 'HENKILO_SUKUNIMI',
            value: props.henkilo.henkilo.sukunimi,
            inputValue: 'sukunimi',
            disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Sukunimi);
