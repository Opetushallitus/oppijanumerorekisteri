import React, { useEffect } from 'react';

import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';

type OwnProps = {
    params: { oid?: string };
};

const AdminRedirect = (props: OwnProps) => {
    useEffect(() => {
        window.location.href = `/henkilo-ui/virkailija/${props.params.oid}`;
    });

    return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={'HENKILO_SIVU_VIRHE_ADMIN'} toggle={true} />;
};

export default AdminRedirect;
