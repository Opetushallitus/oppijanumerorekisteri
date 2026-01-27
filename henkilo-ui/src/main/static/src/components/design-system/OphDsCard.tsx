import React, { ReactNode } from 'react';

type PageProps = {
    children: ReactNode;
};

export const OphDsCard = ({ children }: PageProps) => {
    return <div className="oph-ds-card">{children}</div>;
};
