import React from 'react';
import classNames from 'classnames';
import type { ExistenceCheckState } from '../../../../../reducers/existence.reducer';
import { Link } from 'react-router';
import Button from '../../../../common/button/Button';
import ReactMarkdown from 'react-markdown';
import './ExistenceCheck.css';

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
                {status === 200 && (
                    <b>
                        <Link to={`/oppija/${oid}`}>{oid}</Link>
                    </b>
                )}
                {status === 204 && <Button action={create}>{translate('HENKILO_LUOYHTEYSTIETO')}</Button>}
            </div>
        ) : null}
    </>
);

export default StatusNotification;
