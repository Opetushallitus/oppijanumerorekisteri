import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../reducers';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';

type OwnProps = {
    router: any;
    params: any;
};

type StateProps = {
    oidHenkilo: string;
};

type Props = OwnProps & StateProps;

class AdminRedirect extends React.Component<Props> {
    componentDidMount() {
        this.props.router.replace(`/oppija/${this.props.oidHenkilo}`);
    }

    render() {
        return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={'HENKILO_SIVU_VIRHE_ADMIN'} toggle={true} />;
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    oidHenkilo: ownProps.params['oid'],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(AdminRedirect);
