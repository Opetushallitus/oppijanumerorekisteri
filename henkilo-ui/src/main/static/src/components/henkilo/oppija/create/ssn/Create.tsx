import React from 'react';
import type { ExistenceCheckRequest } from '../../../../../reducers/existence.reducer';
import type { CreatePersonState } from '../../../../../reducers/create.reducer';
import ReactMarkdown from 'react-markdown';
import Button from '../../../../common/button/Button';
import Loader from '../../../../common/icons/Loader';
import CopyToClipboard from './CopyToClipboard';
import './DetailsForm.css';

type Props = CreatePersonState & {
    translate: (key: string) => string;
    createPerson: (payload: ExistenceCheckRequest) => void;
    payload: ExistenceCheckRequest;
    reset: () => void;
};

type ResultProps = Pick<Props, 'translate' | 'status' | 'oid' | 'reset'>;

const Success: React.FC<ResultProps> = ({ translate, oid, reset }) => (
    <>
        <div className="create-result oph-alert-success">
            <ReactMarkdown>{translate('CREATE_PERSON_SUCCESS')}</ReactMarkdown>
            <CopyToClipboard text={oid} translate={translate} />
        </div>
        <Button action={reset}>{translate('HENKILO_LUOYHTEYSTIETO')}</Button>
    </>
);

const ErrorMessage: React.FC<ResultProps> = ({ translate }) => (
    <div className="create-result oph-alert-error">
        <ReactMarkdown>{translate('CREATE_PERSON_FAILURE')}</ReactMarkdown>
    </div>
);

const Result: React.FC<ResultProps> = (props) =>
    props.status === 201 ? <Success {...props} /> : <ErrorMessage {...props} />;

const Create: React.FC<Props> = ({ createPerson, payload, ...rest }) => {
    React.useEffect(() => {
        createPerson(payload);
    }, [createPerson, payload]);

    return rest.status ? <Result {...rest} /> : <Loader />;
};

export default Create;
