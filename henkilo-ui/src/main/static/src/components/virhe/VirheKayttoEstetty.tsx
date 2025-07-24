import * as React from 'react';
import { Link } from 'react-router';
import VirheKirjautunut from './VirheKirjautunut';
import TextButton from '../common/button/TextButton';
import './VirheKayttoEstetty.css';
import { Localisations } from '../../types/localisation.type';

type Props = {
    L: Localisations;
};

/**
 * "Käyttöoikeutesi eivät riitä sivun näyttämiseen." -virhesivu.
 */
const VirheKayttoEstetty = (props: Props) => {
    const takaisin = () => {
        window.history.back();
    };

    return (
        <VirheKirjautunut>
            <div className="VirheKayttoEstetty">
                <div>{props.L['VIRHE_KIRJAUTUNUT_KAYTTO_ESTETTY']}</div>
                <div className="VirheKayttoEstetty_toiminnot">
                    <span className="VirheKayttoEstetty_toiminto">
                        <TextButton action={takaisin}>
                            {props.L['VIRHE_KIRJAUTUNUT_KAYTTO_ESTETTY_TAKAISIN']}
                        </TextButton>
                    </span>
                    <span className="VirheKayttoEstetty_toiminto">
                        <Link to={'/omattiedot'}>{props.L['VIRHE_KIRJAUTUNUT_KAYTTO_ESTETTY_HAE']}</Link>
                    </span>
                </div>
            </div>
        </VirheKirjautunut>
    );
};

export default VirheKayttoEstetty;
