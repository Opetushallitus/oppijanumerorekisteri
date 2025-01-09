import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly?: boolean;
    updateModelFieldAction: (arg0: string) => void;
    disabled: boolean;
    isError?: boolean;
    defaultValue?: string;
};

type StateProps = {
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

const Kayttajanimi = (props: Props) => {
    return (
        <LabelValue
            updateModelFieldAction={props.updateModelFieldAction}
            readOnly={props.readOnly}
            values={{
                label: 'HENKILO_KAYTTAJANIMI',
                value: props.defaultValue || props.henkilo.kayttajatieto?.username,
                inputValue: 'kayttajanimi',
                disabled: props.disabled,
                isError: props.isError,
            }}
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Kayttajanimi);
