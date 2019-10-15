// @flow
import * as React from 'react'
import sad from '../../img/sad.png'
import './VirheKirjautunut.css'

type Props = {
    children: React.Node,
}

/**
 * Käyttö: <VirheKirjautunut>Virheilmoitus</VirheKirjautunut>
 */
class VirheKirjautunut extends React.Component<Props> {

    render() {
        return (
            <div className="VirheKirjautunut">
                <div className="VirheKirjautunut_tausta">
                    <div>
                        <img src={sad} alt="" />
                    </div>
                    {this.props.children}
                </div>
            </div>
        )
    }

}

export default VirheKirjautunut
