import React, { ReactNode } from 'react';

type BannerType = 'warning' | 'info';

type PageProps = {
    children: ReactNode;
    type: BannerType;
};

const OphDsBannerIcon = ({ type }: { type: BannerType }) =>
    type === 'info' ? (
        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12.5 2C6.98 2 2.5 6.48 2.5 12C2.5 17.52 6.98 22 12.5 22C18.02 22 22.5 17.52 22.5 12C22.5 6.48 18.02 2 12.5 2ZM13.5 17H11.5V11H13.5V17ZM13.5 9H11.5V7H13.5V9Z"
                fill="#0033CC"
            />
        </svg>
    ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 21.5H23L12 2.5L1 21.5ZM13 18.5H11V16.5H13V18.5ZM13 14.5H11V10.5H13V14.5Z" fill="#FFCC33" />
        </svg>
    );

export const OphDsBanner = ({ children, type }: PageProps) => {
    return (
        <div className={`oph-ds-banner oph-ds-banner-${type}`}>
            <div className="oph-ds-banner-content">
                <OphDsBannerIcon type={type} />
                <div>{children}</div>
            </div>
        </div>
    );
};
