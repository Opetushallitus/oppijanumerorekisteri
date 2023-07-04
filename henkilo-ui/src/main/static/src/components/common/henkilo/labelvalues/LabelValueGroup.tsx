import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import Columns from 'react-columns';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    label: string;
    valueGroup: any;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const LabelValueGroup = ({ label, L, valueGroup }: Props) => (
    <div id={label}>
        <Columns columns={2} className="labelValue" rootStyles={{ marginRight: '25%' }}>
            <span className="oph-bold">{L[label]}</span>
            {valueGroup}
        </Columns>
    </div>
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(LabelValueGroup);
