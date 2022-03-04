import React from 'react';
import Button from '../../../../common/button/Button';

type Props = {
    text: string;
    translate: (key: string) => string;
};

const CopyToClipboard: React.FC<Props> = ({ text, translate }) => (
    <div className="oph-field" style={{ display: 'flex' }}>
        <input type="text" className="oph-input" value={text || ''} disabled style={{ width: 'fit-content' }} />
        <Button action={() => navigator.clipboard.writeText(text)}>{translate('KOPIOI')}</Button>
    </div>
);

export default CopyToClipboard;
