import * as React from 'react';
import sad from '../../img/sad.png';
import './VirheKirjautunut.css';

type Props = {
    children: React.ReactNode;
};

/**
 * Käyttö: <VirheKirjautunut>Virheilmoitus</VirheKirjautunut>
 */
const VirheKirjautunut = (props: Props) => {
    return (
        <div className="VirheKirjautunut">
            <div className="VirheKirjautunut_tausta">
                <div>
                    <img src={sad} alt="" />
                </div>
                {props.children}
            </div>
        </div>
    );
};

export default VirheKirjautunut;
