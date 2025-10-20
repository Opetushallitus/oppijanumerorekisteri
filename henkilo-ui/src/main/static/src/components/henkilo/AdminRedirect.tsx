import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const AdminRedirect = () => {
    const params = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        navigate(`/virkailija/${params.oid}`, { replace: true });
    });

    return <></>;
};

export default AdminRedirect;
