import React from 'react';
import { Kielisyys } from '../../../types/domain/oppijanumerorekisteri/kielisyys.types';
import { KoodistoSelect } from './KoodistoSelect';
import { Koodisto } from '../../../api/koodisto';

type KielisyysSelectProps = {
    className?: string;
    placeholder: string;
    koodisto: Koodisto;
    value: Kielisyys | null | undefined;
    onChange: (arg0: Kielisyys | null | undefined) => void;
};

/**
 * Komponentti kielisyyden valitsemiseen.
 */
const KielisyysSelect = (props: KielisyysSelectProps) => {
    const onChange = (value: string | null | undefined) => {
        props.onChange(value ? { kieliKoodi: value } : null);
    };

    return (
        <KoodistoSelect
            className={props.className}
            placeholder={props.placeholder}
            koodisto={props.koodisto}
            value={props.value ? props.value.kieliKoodi : null}
            onChange={onChange}
        />
    );
};

export default KielisyysSelect;
