import './LoaderWithText.css';
import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../reducers';
import { Localisations } from '../../../types/localisation.type';
import Loader from '../icons/Loader';

type OwnProps = {
    label?: string;
    labelkey: string | null | undefined;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const LoaderWithText = (props: Props) => (
    <div className="loader-with-text">
        <Loader />
        <span>{props.labelkey ? props.L[props.labelkey] : props.label || ''}</span>
    </div>
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps>(mapStateToProps, {})(LoaderWithText);
