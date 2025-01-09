import React from 'react';
import classNames from 'classnames';
import type { ExistenceCheckState } from '../../../../../reducers/existence.reducer';
import ReactMarkdown from 'react-markdown';
import Button from '../../../../common/button/Button';
import CopyToClipboard from './CopyToClipboard';
import './DetailsForm.css';

type Props = Omit<ExistenceCheckState, 'loading'> & {
    translate: (key: string) => string;
    create: () => void;
};

const StatusNotification: React.FC<Props> = ({ translate, create, msgKey, status, oid }) => (
    <>
        {msgKey ? (
            <div
                className={classNames('check-result', {
                    'oph-alert-success': status === 200,
                    'oph-alert-info': status === 204,
                    'oph-alert-error': status >= 400,
                })}
            >
                <ReactMarkdown>{translate(msgKey)}</ReactMarkdown>
                {status === 200 && <CopyToClipboard text={oid} translate={translate} />}
                {status === 204 && <Button action={create}>{translate('HENKILO_LUOYHTEYSTIETO')}</Button>}
            </div>
        ) : null}
    </>
);

export default StatusNotification;
