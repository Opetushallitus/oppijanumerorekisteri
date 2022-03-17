import React from 'react';
import Button from '../../../../common/button/Button';
import './DetailsForm.css';

type Props = {
    text: string;
    translate: (key: string) => string;
};

const CopyToClipboard: React.FC<Props> = ({ text, translate }) => {
    return (
        <div className="oph-field copy-to-clipboard">
            <input type="text" className="oph-input" value={text || ''} readOnly />
            <Button action={() => navigator.clipboard.writeText(text)}>{translate('KOPIOI')}</Button>
        </div>
    );
};

export default CopyToClipboard;
