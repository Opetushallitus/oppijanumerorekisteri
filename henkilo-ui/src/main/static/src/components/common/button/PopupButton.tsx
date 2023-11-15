import React, { ReactNode, useRef, useState } from 'react';
import './PopupButton.css';
import type CSS from 'csstype';
import { useOnClickOutside } from '../../../useOnClickOutside';

type Props = {
    popupTitle?: string | ReactNode; // Title/header for the popup
    popupContent: React.ReactNode; // React element as popup content
    children: ReactNode; // Button text
    popupClass?: string; // css-classes for popup (see oph style guide)
    popupStyle?: CSS.Properties; // css-styles for positioning popup
    disabled?: boolean;
    simple?: boolean;
    popupButtonWrapperPositioning?: CSS.Property.Position; // value for css-position attribute (defaults to relative)
    popupArrowStyles?: CSS.Properties; // css-styles to position arrow
    popupButtonClasses?: string; // css-classes for button (see oph style guide)
    id?: string;
};

const defaultPopupClass = 'oph-popup-default oph-popup-bottom';

/*
 * Component button with custom popup attached to it
 */
const PopupButton = (props: Props) => {
    const [show, setShow] = useState(false);
    const ref = useRef(null);
    useOnClickOutside(ref, () => setShow(false));

    function createPopup() {
        const closeButtonStyles: Partial<CSS.Properties> = {
            float: 'right',
            clear: 'right',
            cursor: 'pointer',
            marginTop: '-20px',
            marginRight: '-20px',
        };
        return (
            <div
                className={`oph-popup ${props.popupClass ?? defaultPopupClass} popup-paddings`}
                style={props.popupStyle}
            >
                <div className="oph-popup-arrow" style={props.popupArrowStyles}></div>
                <div style={closeButtonStyles}>
                    <i className="fa fa-times" onClick={() => setShow(false)}></i>
                </div>
                <div className="oph-popup-title">{props.popupTitle}</div>
                <div className="oph-popup-content">{props.popupContent}</div>
            </div>
        );
    }

    function createSimplePopup() {
        return (
            <div
                className={`oph-popup ${props.popupClass ?? defaultPopupClass} popup-paddings`}
                style={props.popupStyle}
            >
                <div className="oph-popup-arrow" style={props.popupArrowStyles}></div>
                <div className="oph-popup-content" style={{ marginTop: 0 }}>
                    {props.popupContent}
                </div>
            </div>
        );
    }

    const wrapperStyle = props.popupButtonWrapperPositioning ? { position: props.popupButtonWrapperPositioning } : {};
    return (
        <div style={wrapperStyle} className="popup-button">
            <button
                onClick={() => setShow(!show)}
                className={props.popupButtonClasses ?? 'oph-button oph-button-primary'}
                type="button"
                disabled={props.disabled}
                id={props.id}
            >
                {props.children}
            </button>
            {show && <div ref={ref}>{props.simple ? createSimplePopup() : createPopup()}</div>}
        </div>
    );
};

export default PopupButton;
