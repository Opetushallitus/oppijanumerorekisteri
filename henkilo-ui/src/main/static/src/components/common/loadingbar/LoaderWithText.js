// @flow
import './LoaderWithText.css';
import React from 'react';
import {connect} from 'react-redux';
import type {L} from "../../../types/localisation.type";
import Loader from "../icons/Loader";

type Props = {
    L: L,
    label?: string,
    labelkey: ?string,
}

const LoaderWithText = (props: Props) => <div className="loader-with-text"><Loader /><span>{props.labelkey ? props.L[props.labelkey]: props.label || ''}</span></div>;

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(LoaderWithText);
