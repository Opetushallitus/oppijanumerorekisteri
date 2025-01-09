import React, { useState } from 'react';

import TextButton from '../../common/button/TextButton';

import './DuplikaatitApplicationsPopup.css';

type Props = {
    children: React.ReactNode;
    title: string;
};

const DuplikaatitApplicationsPopup = ({ title, children }: Props) => {
    const [show, setShow] = useState(false);
    return (
        <div className="applications-wrapper">
            <TextButton action={() => setShow(!show)}>{title}</TextButton>
            {show && (
                <div className={`oph-popup oph-popup-default oph-popup-right other-applications`}>
                    <div className="oph-popup-arrow"></div>
                    <div className="close-applications-div">
                        <button className="close-applications-button fa fa-times" onClick={() => setShow(false)} />
                    </div>
                    <div className="oph-popup-content">
                        <div>{children}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuplikaatitApplicationsPopup;
