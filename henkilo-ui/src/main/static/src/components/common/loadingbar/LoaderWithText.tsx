import './LoaderWithText.css';
import React from 'react';

import Loader from '../icons/Loader';
import { useLocalisations } from '../../../selectors';

type OwnProps = {
    label?: string;
    labelkey: string | null | undefined;
};

const LoaderWithText = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <div className="loader-with-text">
            <Loader />
            <span>{props.labelkey ? L[props.labelkey] : props.label || ''}</span>
        </div>
    );
};

export default LoaderWithText;
