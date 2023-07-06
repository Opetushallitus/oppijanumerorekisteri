import React, { ReactNode } from 'react';
import '../../../flex.css';

type Props = {
    children: ReactNode;
};

const OphInline = ({ children }: Props) => <div className="flex-inline">{children}</div>;

export default OphInline;
