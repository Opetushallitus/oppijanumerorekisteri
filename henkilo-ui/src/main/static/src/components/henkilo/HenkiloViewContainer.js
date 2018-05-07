// @flow

import React from 'react'
import {connect} from 'react-redux';
import type {OmattiedotState} from "../../reducers/omattiedot.reducer";
import AdminViewContainer from "./AdminViewContainer";
import VirkailijaViewContainer from "./VirkailijaViewContainer";
import OppijaViewContainer from "./OppijaViewContainer";

type Props = {
    path: string,
    omattiedot: OmattiedotState,
    oidHenkilo: string,
    henkiloType: string,
    router: any
}


/*
 * Henkilo-näkymä. Päätellään näytetäänkö admin/virkailija/oppija -versio henkilöstä
 */
class HenkiloViewContainer extends React.Component<Props> {

    render() {
        const view = this.props.path.split('/')[1];

        if(this.props.omattiedot.isAdmin) {
            return <AdminViewContainer {...this.props}></AdminViewContainer>
        } else if(view === 'virkailija') {
            return <VirkailijaViewContainer></VirkailijaViewContainer>
        } else if(view === 'oppija') {
            return <OppijaViewContainer></OppijaViewContainer>
        }

        return <h3>henkilo</h3>
    }

}

const mapStateToProps = (state, ownProps) => ({
    path: ownProps.location.pathname,
    oidHenkilo: ownProps.params['oid'],
    henkiloType: ownProps.params['henkiloType'],
    omattiedot: state.omattiedot
});

export default connect(mapStateToProps, {})(HenkiloViewContainer)

