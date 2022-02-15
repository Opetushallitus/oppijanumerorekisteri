import React from 'react';
import type { ExistenceCheckRequest } from '../../../../../reducers/existence.reducer';

type Props = {
    payload: ExistenceCheckRequest;
};

const Create: React.FC<Props> = ({ payload }) => <pre>{JSON.stringify(payload, undefined, 4)}</pre>;

export default Create;
