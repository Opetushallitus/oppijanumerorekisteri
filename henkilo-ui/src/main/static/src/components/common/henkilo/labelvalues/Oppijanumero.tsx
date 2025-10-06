import React, { SyntheticEvent } from 'react';
import type { RootState } from '../../../../store';
import { useSelector } from 'react-redux';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { useGetHenkiloMasterQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Oppijanumero = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: master } = useGetHenkiloMasterQuery(henkilo.henkilo.oidHenkilo);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_OPPIJANUMERO',
                value: master?.oppijanumero || henkilo.henkilo.oppijanumero,
                inputValue: 'oppijanumero',
                readOnly: true,
            }}
        />
    );
};

export default Oppijanumero;
