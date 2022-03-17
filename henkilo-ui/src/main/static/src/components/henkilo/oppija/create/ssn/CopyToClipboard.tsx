import React, { useState } from 'react';
import classnames from 'classnames';
import Button from '../../../../common/button/Button';
import './DetailsForm.css';

type Props = {
    text: string;
    translate: (key: string) => string;
};

const CopyToClipboard: React.FC<Props> = ({ text, translate }) => {
    const [copied, setCopied] = useState<boolean>(false);
    const copyToCliplboard = () => {
        try {
            navigator.clipboard.writeText(text);
            setCopied(true);
        } catch (e) {
            console.log('Failed to copy oid to the clipboard', e);
        }
    };
    return (
        <div className="oph-field copy-to-clipboard">
            <input type="text" className="oph-input" value={text || ''} readOnly />
            <Button action={copyToCliplboard}>
                <i className={classnames('fa', copied ? 'fa-check' : 'fa-copy')} aria-hidden="true" />
                {translate('KOPIOI')}
            </Button>
        </div>
    );
};

export default CopyToClipboard;
