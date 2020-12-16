import React from 'react';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';

const TyoSahkoposti = (props) => (
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
