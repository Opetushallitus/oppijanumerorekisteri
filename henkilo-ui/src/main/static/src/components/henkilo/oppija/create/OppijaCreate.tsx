import React from 'react';

import OppijaCreateSsnContainer from './ssn/OppijaCreateSsnContainer';
import { OppijaCreateAnonymousContainer } from './anonymous/OppijaCreateAnonymousContainer';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { useLocalisations } from '../../../../selectors';
import { useTitle } from '../../../../useTitle';
import { useNavigation } from '../../../../useNavigation';
import { oppijaNavigation } from '../../../navigation/navigationconfigurations';
import { useGetOmattiedotQuery } from '../../../../api/kayttooikeus';

type FormType = 'ssn' | 'anonymous';

export const OppijaCreate = () => {
    const { L } = useLocalisations();
    useTitle(L('TITLE_OPPIJA_LUONTI'));
    useNavigation(oppijaNavigation);
    const { data } = useGetOmattiedotQuery();
    const [formType, setFormType] = React.useState<FormType>();
    const goBack = () => setFormType(undefined);
    switch (formType) {
        case 'ssn':
            return <OppijaCreateSsnContainer goBack={goBack} />;
        case 'anonymous':
            return <OppijaCreateAnonymousContainer goBack={goBack} />;
        default:
            return (
                <div className="mainContent wrapper">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2>{L('OPPIJAN_LUONTI_OTSIKKO')}</h2>
                        {(data?.isAdmin ||
                            hasAnyPalveluRooli(data?.organisaatiot, [
                                'OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI',
                            ])) && (
                            <button
                                className="oph-button oph-button-primary"
                                data-testid="oppijan-luonti-hetullinen"
                                type="button"
                                onClick={() => setFormType('ssn')}
                            >
                                {L('OPPIJAN_LUONTI_HETULLINEN')}
                            </button>
                        )}
                        {(data?.isAdmin ||
                            hasAnyPalveluRooli(data?.organisaatiot, ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'])) && (
                            <button
                                className="oph-button oph-button-primary"
                                data-testid="oppijan-luonti-hetuton"
                                type="button"
                                onClick={() => setFormType('anonymous')}
                            >
                                {L('OPPIJAN_LUONTI_HETUTON')}
                            </button>
                        )}
                    </div>
                </div>
            );
    }
};
