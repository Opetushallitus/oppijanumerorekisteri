import React from 'react';
import { connect } from 'react-redux';
import type { Localisations } from '../../../../../types/localisation.type';
import type { RootState } from '../../../../../reducers';
import Button from '../../../../common/button/Button';

type OwnProps = {
    goBack: () => void;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

export const CreateWithSSN: React.FC<Props> = ({ L, goBack }) => {
    const translate = (key: string): string => L[key] || key;
    return (
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{translate('OPPIJAN_LUONTI_OTSIKKO')}</span>
            <hr />
            <b>WIP</b>
            <hr />
            <Button action={goBack}>{translate('TAKAISIN_LINKKI')}</Button>
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(CreateWithSSN);
