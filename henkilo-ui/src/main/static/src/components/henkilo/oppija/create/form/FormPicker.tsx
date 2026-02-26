import React from 'react';

import type { FormType } from './types';
import Button from '../../../../common/button/Button';
import './FormPicker.css';
import { useLocalisations } from '../../../../../selectors';
import { hasAnyPalveluRooli } from '../../../../../utilities/palvelurooli.util';
import { useGetOmattiedotQuery } from '../../../../../api/kayttooikeus';

type Props = {
    setFormType: (type: FormType) => void;
};

export const FormPicker = ({ setFormType }: Props) => {
    const { L } = useLocalisations();
    const { data } = useGetOmattiedotQuery();
    return (
        <div className="mainContent wrapper">
            <div className="form-picker">
                <span className="oph-h2 oph-bold">{L('OPPIJAN_LUONTI_OTSIKKO')}</span>
                {(data?.isAdmin ||
                    hasAnyPalveluRooli(data?.organisaatiot, ['OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI'])) && (
                    <Button action={() => setFormType('ssn')}>{L('OPPIJAN_LUONTI_HETULLINEN')}</Button>
                )}
                {(data?.isAdmin ||
                    hasAnyPalveluRooli(data?.organisaatiot, ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'])) && (
                    <Button action={() => setFormType('anonymous')}>{L('OPPIJAN_LUONTI_HETUTON')}</Button>
                )}
            </div>
        </div>
    );
};

export default FormPicker;
