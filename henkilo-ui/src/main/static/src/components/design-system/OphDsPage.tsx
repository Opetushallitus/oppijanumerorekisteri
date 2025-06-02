import React, { ReactNode } from 'react';

type PageProps = {
    header: string;
    children: ReactNode;
};

export const OphDsPage = ({ header, children }: PageProps) => {
    return (
        <div className="oph-ds-page-layout">
            <header className="oph-ds-page-header-container">
                <h1 className="oph-ds-page-header">{header}</h1>
            </header>
            <main className="oph-ds-page-content-container">{children}</main>
        </div>
    );
};
