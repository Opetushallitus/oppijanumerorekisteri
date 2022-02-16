import React from 'react';
import type { ExistenceCheckRequest } from '../../../../../reducers/existence.reducer';
import type { CreatePersonState } from '../../../../../reducers/create.reducer';
import { Link } from 'react-router';
import ReactMarkdown from 'react-markdown';
import Loader from '../../../../common/icons/Loader';
import './DetailsForm.css';

type Props = CreatePersonState & {
    translate: (key: string) => string;
    createPerson: (payload: ExistenceCheckRequest) => void;
    payload: ExistenceCheckRequest;
};

type ResultProps = Pick<Props, 'translate' | 'status' | 'oid'>;

const Success: React.FC<ResultProps> = ({ translate, oid }) => (
    <div className="create-result oph-alert-success">
        <ReactMarkdown>{translate('CREATE_PERSON_SUCCESS')}</ReactMarkdown>
        <Link to={`/oppija/${oid}`}>{oid}</Link>
    </div>
);

const Error: React.FC<ResultProps> = ({ translate }) => (
    <div className="create-result oph-alert-error">
        <ReactMarkdown>{translate('CREATE_PERSON_FAILURE')}</ReactMarkdown>
    </div>
);

const Result: React.FC<ResultProps> = (props) => (props.status === 201 ? <Success {...props} /> : <Error {...props} />);

const Create: React.FC<Props> = ({ createPerson, payload, loading, ...rest }) => {
    React.useEffect(() => {
        createPerson(payload);
    }, [createPerson, payload]);

    return loading ? <Loader /> : <Result {...rest} />;
};

export default Create;
