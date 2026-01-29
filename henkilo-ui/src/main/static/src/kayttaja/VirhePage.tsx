import React, { ReactNode } from 'react';

import './VirhePage.css';
import Button from '../components/common/button/Button';
import { useLocalisations } from '../selectors';
import { useTitle } from '../useTitle';

type OwnProps = {
    topic?: string;
    text?: string;
    buttonText?: string;
    theme?: string;
    children?: ReactNode;
};

const VirhePage = (props: OwnProps) => {
    const { getLocalisations } = useLocalisations(true);
    const L = getLocalisations('fi');

    useTitle(L['TITLE_VIRHESIVU']);

    const classname = props.theme === 'gray' ? 'virhePageVirheWrapperGray' : 'virhePageVirheWrapper';
    return (
        <div className={classname} id="virhePageVirhe">
            <p className="oph-h2 oph-bold oph-red">{props.topic ? L[props.topic] : L['VIRHE_PAGE_DEFAULT_OTSIKKO']}</p>
            {props.text ? <p className="oph-bold">{L[props.text]}</p> : null}
            {props.buttonText ? <Button href="/">{L[props.buttonText]}</Button> : null}
            {props.children ?? ''}
        </div>
    );
};

export default VirhePage;
