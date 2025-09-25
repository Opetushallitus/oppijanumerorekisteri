import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';

const AdminRedirect = () => {
    const params = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        navigate(`/virkailija/${params.oid}`, { replace: true });
    });

    return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={'HENKILO_SIVU_VIRHE_ADMIN'} toggle={true} />;
};

export default AdminRedirect;
