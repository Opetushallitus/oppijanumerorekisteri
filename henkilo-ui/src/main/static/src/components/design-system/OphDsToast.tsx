import React from 'react';
import { useSelector } from 'react-redux';

import { RootState, useAppDispatch } from '../../store';
import { useLocalisations } from '../../selectors';
import { remove } from '../../slices/toastSlice';

type ToastType = 'ok' | 'error';

export type ToastProps = {
    id: string;
    body?: string;
    header?: string;
    type: ToastType;
};

const ToastIcon = ({ type }: { type: ToastType }) => {
    return type === 'ok' ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"
                fill="white"
            />
        </svg>
    ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M11 15H13V17H11V15ZM11 7H13V13H11V7ZM11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"
                fill="white"
            />
        </svg>
    );
};

export const OphDsToast = ({ id, body, header, type }: ToastProps) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    return (
        <div className={`oph-ds-toast oph-ds-toast-${type}`}>
            <div className="oph-ds-toast-header">
                <ToastIcon type={type} />
                <span>{header}</span>
            </div>
            <div className="oph-ds-toast-body">{body}</div>
            <button
                type="button"
                aria-label={L('TUONTIDATA_SULJE')}
                className="oph-ds-toast-close-button"
                onClick={() => dispatch(remove(id))}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                        fill="white"
                    />
                </svg>
            </button>
        </div>
    );
};

export const OphDsToasts = () => {
    const { toasts } = useSelector((state: RootState) => state.toasts);
    return (
        <div className="oph-ds-toasts">
            {toasts.map((t) => (
                <OphDsToast key={t.id} {...t} />
            ))}
        </div>
    );
};
