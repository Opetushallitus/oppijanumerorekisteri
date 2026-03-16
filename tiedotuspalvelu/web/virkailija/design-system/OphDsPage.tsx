import React, { ReactNode } from 'react';

type PageProps = {
    header: string;
    children: ReactNode;
    tabs?: ReactNode;
};

export const OphDsPage = ({ header, children, tabs }: PageProps) => {
    return (
        <div className="oph-ds-page-layout">
            <header className="oph-ds-page-header-container">
                <h1 className="oph-ds-page-header">{header}</h1>
            </header>
            <div className="oph-ds-page-content-container">
                {tabs && <nav className="oph-ds-page-tabs">{tabs}</nav>}
                <main className="oph-ds-page-main">{children}</main>
            </div>
        </div>
    );
};
