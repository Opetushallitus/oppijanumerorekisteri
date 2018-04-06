// @flow
import * as React from 'react'
import { connect } from 'react-redux'
import {updateEmptyNavigation} from '../../actions/navigation.actions'
import sad from '../../img/sad.png'
import './VirheKirjautunut.css'
import type {Navigation} from "../../actions/navigation.actions";

type Props = {
    children: React.Node,
    updateEmptyNavigation: () => Navigation,
}

/**
 * Käyttö: <VirheKirjautunut>Virheilmoitus</VirheKirjautunut>
 */
class VirheKirjautunut extends React.Component<Props> {

    componentDidMount() {
        this.props.updateEmptyNavigation()
    }

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

export default connect(() => ({}), { updateEmptyNavigation })(VirheKirjautunut)
