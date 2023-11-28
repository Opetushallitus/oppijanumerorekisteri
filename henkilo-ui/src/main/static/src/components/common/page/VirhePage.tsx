import React from 'react';

import './VirhePage.css';
import Button from '../button/Button';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';

type OwnProps = {
    topic?: string;
    text?: string;
    buttonText?: string;
    theme?: string;
};

const VirhePage = (props: OwnProps) => {
    const { l10n } = useLocalisations();
    const L = l10n.localisations['fi'];

    useTitle(L['TITLE_VIRHESIVU']);

    const classname = props.theme === 'gray' ? 'virhePageVirheWrapperGray' : 'virhePageVirheWrapper';
    return (
        <div className={classname} id="virhePageVirhe">
            <p className="oph-h2 oph-bold oph-red">{props.topic ? L[props.topic] : L['VIRHE_PAGE_DEFAULT_OTSIKKO']}</p>
            <div>
                {props.text ? <p className="oph-bold">{L[props.text]}</p> : null}
                {props.buttonText ? <Button href="/">{L[props.buttonText]}</Button> : null}
            </div>
        </div>
    );
};

export default VirhePage;
