// @flow
import React from 'react'
import {connect} from 'react-redux';
import {LocalNotification} from "../common/Notification/LocalNotification";
import {NOTIFICATIONTYPES} from "../common/Notification/notificationtypes";


type Props = {
    router: any,
    oidHenkilo: string
}

class AdminRedirect extends React.Component<Props> {

    componentDidMount() {
        this.props.router.replace(`/oppija/${this.props.oidHenkilo}`);
    }

    render() {
        return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={'HENKILO_SIVU_VIRHE_ADMIN'} toggle={true}/>
    }

}

const mapStateToProps = (state, ownProps) => ({
    oidHenkilo: ownProps.params['oid']
});

export default connect(mapStateToProps, {})(AdminRedirect);