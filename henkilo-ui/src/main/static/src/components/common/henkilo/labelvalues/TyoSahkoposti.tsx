import React from 'react';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';

type Props = {
    henkiloUpdate: Henkilo;
};

const TyoSahkoposti = (props: Props) => (
    <LabelValue
        {...props}
        values={StaticUtils.findOrCreateYhteystiedotRyhmaFlat(
            props.henkiloUpdate,
            'yhteystietotyyppi2',
            'YHTEYSTIETO_SAHKOPOSTI',
            'HENKILO_TYOSAHKOPOSTI'
        )}
    />
);

export default TyoSahkoposti;
