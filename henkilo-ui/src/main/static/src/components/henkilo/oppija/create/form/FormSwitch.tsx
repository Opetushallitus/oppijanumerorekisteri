import React from 'react';
import { BrowserRouter } from 'react-router';
import type { FormType } from './types';
import AnonymousForm from '../anonymous';
import SSNForm from '../ssn';
import FormPicker from './FormPicker';

type Props = {
    router: BrowserRouter;
};

const FormSwitch: React.FC<Props> = ({ router }) => {
    const [formType, setFormType] = React.useState<FormType>();
    const goBack = () => setFormType(undefined);
    switch (formType) {
        case 'ssn':
            return <SSNForm goBack={goBack} />;
        case 'anonymous':
            return <AnonymousForm router={router} goBack={goBack} />;
        default:
            return <FormPicker setFormType={(type: FormType) => setFormType(type)} />;
    }
};

export default FormSwitch;
