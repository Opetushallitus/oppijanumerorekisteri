import React from 'react';

import type { FormType } from './types';
import OppijaCreateSsnContainer from '../ssn/OppijaCreateSsnContainer';
import { OppijaCreateAnonymousContainer } from '../anonymous/OppijaCreateAnonymousContainer';
import FormPicker from './FormPicker';
import { useLocalisations } from '../../../../../selectors';
import { useTitle } from '../../../../../useTitle';
import { useNavigation } from '../../../../../useNavigation';
import { mainNavigation } from '../../../../navigation/navigationconfigurations';

const FormSwitch = () => {
    const { L } = useLocalisations();
    useTitle(L('TITLE_OPPIJA_LUONTI'));
    useNavigation(mainNavigation, false);
    const [formType, setFormType] = React.useState<FormType>();
    const goBack = () => setFormType(undefined);
    switch (formType) {
        case 'ssn':
            return <OppijaCreateSsnContainer goBack={goBack} />;
        case 'anonymous':
            return <OppijaCreateAnonymousContainer goBack={goBack} />;
        default:
            return <FormPicker setFormType={(type) => setFormType(type)} />;
    }
};

export default FormSwitch;
