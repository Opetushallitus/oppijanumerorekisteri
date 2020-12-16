import React from 'react';
import { connect } from 'react-redux';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction: () => void;
};

type Props = OwnProps & {
    henkilo: HenkiloState;
};

const Oid = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: 'HENKILO_OID',
            value: props.henkilo.henkilo.oidHenkilo,
            inputValue: 'oidHenkilo',
            readOnly: true,
        }}
    />
);

const mapStateToProps = (state) => ({
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps>(mapStateToProps, {})(Oid);
