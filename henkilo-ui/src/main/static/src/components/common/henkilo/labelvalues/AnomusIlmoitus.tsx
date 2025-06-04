import React, { useEffect, useMemo, useState } from 'react';
import { urls } from 'oph-urls-js';
import Select from 'react-select';

import { http } from '../../../../http';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import { Kayttooikeusryhma } from '../../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../../../utilities/localisation.util';
import { NamedMultiSelectOption } from '../../../../utilities/select';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    updateModelSelectAction: (arg0: NamedMultiSelectOption) => void;
    omattiedot: OmattiedotState;
    readOnly?: boolean;
    henkiloUpdate: Henkilo;
};

const renderOptions = (options: { value: number; label: string }[], anomusilmoitus: number[]) => {
    return (
        <ul>
            {options
                .filter((o) => !!anomusilmoitus.find((a) => a === o.value))
                .map((o) => (
                    <li key={o.value}>{o.label}</li>
                ))}
        </ul>
    );
};

export const AnomusIlmoitus = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const [vastuukayttajaRyhmat, setVastuukayttajaRyhmat] = useState<Kayttooikeusryhma[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const url = urls.url('kayttooikeus-service.kayttooikeusryhma.by-kayttooiokeus');
            const v: Array<Kayttooikeusryhma> = await http.post(url, {
                KAYTTOOIKEUS: 'VASTUUKAYTTAJAT',
            });
            setVastuukayttajaRyhmat(v);
        };

        fetch();
    }, []);

    const options = useMemo(() => {
        return vastuukayttajaRyhmat.map((vastuukayttajaRyhma) => ({
            value: vastuukayttajaRyhma.id,
            label: localizeTextGroup(vastuukayttajaRyhma.nimi?.texts, locale),
            optionsName: 'anomusilmoitus',
        }));
    }, [vastuukayttajaRyhmat]);

    return (
        <FieldlessLabelValue label="HENKILO_ANOMUSILMOITUKSET">
            {props.readOnly ? (
                renderOptions(options, props.henkiloUpdate.anomusilmoitus)
            ) : (
                <Select
                    options={options}
                    isMulti={true}
                    isDisabled={props.readOnly}
                    value={options.filter((o) => !!props.henkiloUpdate.anomusilmoitus.find((a) => a === o.value))}
                    onChange={(tilaukset) => {
                        return (
                            tilaukset &&
                            props.updateModelSelectAction({
                                optionsName: 'anomusilmoitus',
                                value: [...tilaukset.map((tilaus) => tilaus.value)],
                            })
                        );
                    }}
                />
            )}
        </FieldlessLabelValue>
    );
};
