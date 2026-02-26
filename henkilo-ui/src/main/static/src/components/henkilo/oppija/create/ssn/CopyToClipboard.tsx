import React, { useState } from 'react';
import classnames from 'classnames';
import Button from '../../../../common/button/Button';
import './DetailsForm.css';
import { useLocalisations } from '../../../../../selectors';

type Props = {
    text: string;
};

const CopyToClipboard: React.FC<Props> = ({ text }) => {
    const [copied, setCopied] = useState<boolean>(false);
    const { L } = useLocalisations();
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
                {L('KOPIOI')}
            </Button>
        </div>
    );
};

export default CopyToClipboard;
