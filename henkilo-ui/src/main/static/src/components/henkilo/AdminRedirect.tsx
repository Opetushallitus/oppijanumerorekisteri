import React from 'react';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { RouteActions } from 'react-router-redux';

type OwnProps = {
    router: RouteActions;
    params: { oid?: string };
};

class AdminRedirect extends React.Component<OwnProps> {
    componentDidMount() {
        this.props.router.replace(`/oppija/${this.props.params.oid}`);
    }

    render() {
        return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={'HENKILO_SIVU_VIRHE_ADMIN'} toggle={true} />;
    }
}

export default AdminRedirect;
