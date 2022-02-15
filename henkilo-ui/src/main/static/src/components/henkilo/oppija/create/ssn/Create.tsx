import React from 'react';
import type { ExistenceCheckRequest } from '../../../../../reducers/existence.reducer';
import type { CreatePersonState } from '../../../../../reducers/create.reducer';
import { Link } from 'react-router';
import ReactMarkdown from 'react-markdown';
import Loader from '../../../../common/icons/Loader';
import './ExistenceCheck.css';

type Props = CreatePersonState & {
    translate: (key: string) => string;
    createPerson: (payload: ExistenceCheckRequest) => void;
    payload: ExistenceCheckRequest;
};

const Success: React.FC<Props> = ({ translate, oid }) => (
    <div className="create-result oph-alert-success">
        <ReactMarkdown>{translate('CREATE_PERSON_SUCCESS')}</ReactMarkdown>
        <Link to={`/oppija/${oid}`}>{oid}</Link>
    </div>
);

const Error: React.FC<Props> = ({ translate }) => (
    <div className="create-result oph-alert-error">
        <ReactMarkdown>{translate('CREATE_PERSON_FAILURE')}</ReactMarkdown>
    </div>
);

const Result: React.FC<Props> = (props) => (props.status === 201 ? <Success {...props} /> : <Error {...props} />);

const Wrapper: React.FC<Props> = (props) => {
    React.useEffect(() => {
        props.createPerson(props.payload);
    }, [props, props.createPerson, props.payload]);

    return props.loading ? <Loader /> : <Result {...props} />;
};

export default Wrapper;
