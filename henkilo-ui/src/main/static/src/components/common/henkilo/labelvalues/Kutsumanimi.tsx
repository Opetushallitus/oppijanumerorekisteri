import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    isError?: boolean;
    readOnly: boolean;
    updateModelFieldAction: (arg0: string) => void;
    defaultValue?: string;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Kutsumanimi = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: 'HENKILO_KUTSUMANIMI',
            value: props.defaultValue || props.henkilo.henkilo.kutsumanimi,
            inputValue: 'kutsumanimi',
            isError: props.isError,
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps>(mapStateToProps)(Kutsumanimi);
