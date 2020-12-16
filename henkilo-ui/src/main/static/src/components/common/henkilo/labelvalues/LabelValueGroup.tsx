import React from 'react';
import { connect } from 'react-redux';
import Columns from 'react-columns';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    label: string;
    valueGroup: any;
};

type Props = OwnProps & {
    L: Localisations;
};

const LabelValueGroup = ({ label, L, valueGroup }: Props) => (
    <div id={label}>
        <Columns columns={2} className="labelValue" rootStyles={{ marginRight: '25%' }}>
            <span className="oph-bold">{L[label]}</span>
            {valueGroup}
        </Columns>
    </div>
);

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<Props, OwnProps>(mapStateToProps, {})(LabelValueGroup);
