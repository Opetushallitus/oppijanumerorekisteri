import React, { useMemo, useState } from 'react';
import Select from 'react-select';

import { useLocalisations } from '../../../selectors';
import { Locale } from '../../../types/locale.type';
import { Koodi, koodiLabel, Koodisto } from '../../../api/koodisto';

import './KoodistoSelect.css';

type OwnProps = {
    className?: string;
    placeholder: string;
    koodisto: Koodisto;
    value?: string;
    onChange: (arg0: string) => void;
};

const getInitialValue = (koodisto: Koodisto, value: string, locale: Locale) => {
    const koodi = koodisto?.find((k) => k.koodiArvo === value);
    return {
        value: koodi.koodiArvo,
        label: koodiLabel(koodi, locale),
    };
};

/**
 * Komponentti koodiston koodin valitsemiseen.
 */
export const KoodistoSelect = ({ className, placeholder, koodisto, value, onChange }: OwnProps) => {
    const { locale } = useLocalisations();
    const options = useMemo(() => {
        return koodisto
            ?.map((koodi: Koodi) => {
                return {
                    value: koodi.koodiArvo,
                    label: koodiLabel(koodi, locale),
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [koodisto]);
    const [selectedOption, setSelectedOption] = useState(value ? getInitialValue(koodisto, value, locale) : null);

    return (
        <Select
            className={className}
            placeholder={placeholder}
            options={options}
            value={selectedOption}
            onChange={(o) => {
                setSelectedOption(o);
                onChange(o.value);
            }}
        />
    );
};
