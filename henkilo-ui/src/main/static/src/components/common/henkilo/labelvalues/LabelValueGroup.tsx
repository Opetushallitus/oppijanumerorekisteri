import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    label: string;
    valueGroup: ReactNode;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const LabelValueGroup = ({ label, L, valueGroup }: Props) => (
    <div id={label}>
        <div className="labelValue" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <span className="oph-bold">{L[label]}</span>
            {valueGroup}
        </div>
    </div>
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(LabelValueGroup);
