import React from 'react';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';

type Props = {
    henkiloUpdate: Henkilo;
};

const TyoPuhelin = (props: Props) => (
    <LabelValue
        {...props}
        values={StaticUtils.findOrCreateYhteystiedotRyhmaFlat(
            props.henkiloUpdate,
            'yhteystietotyyppi2',
            'YHTEYSTIETO_PUHELINNUMERO',
            'HENKILO_TYOPUHELIN'
        )}
    />
);

export default TyoPuhelin;
