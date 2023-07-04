import React, { ReactNode } from 'react';

type Props = {
    show: boolean;
    children: ReactNode;
};

export const ShowText = (props: Props) => {
    return <span>{props.show ? props.children : ''}</span>;
};
