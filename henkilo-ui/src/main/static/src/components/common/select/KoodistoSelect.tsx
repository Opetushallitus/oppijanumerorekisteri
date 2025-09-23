import React, { useMemo, useState } from 'react';
import Select from 'react-select';

import { toLocalizedText } from '../../../localizabletext';
import { useLocalisations } from '../../../selectors';

import './KoodistoSelect.css';
import { Locale } from '../../../types/locale.type';
import { Koodi, Koodisto } from '../../../api/koodisto';

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
        label: toLocalizedText(locale, koodi.metadata, koodi.koodiArvo),
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
                    label: toLocalizedText(locale, koodi.metadata, koodi.koodiArvo) as string,
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
