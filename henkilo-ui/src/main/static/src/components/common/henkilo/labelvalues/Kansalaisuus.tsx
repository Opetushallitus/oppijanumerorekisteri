import React, { useMemo } from 'react';
import Select from 'react-select';

import { isVahvastiYksiloity, localizeKoodiNimi } from '../../StaticUtils';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { NamedMultiSelectOption } from '../../../../utilities/select';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { useGetKansalaisuudetQuery } from '../../../../api/koodisto';
import { useLocalisations } from '../../../../selectors';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (arg0: NamedMultiSelectOption) => void;
};

const Kansalaisuus = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const kansalaisuus = props.henkiloUpdate.kansalaisuus || [];
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloUpdate.oidHenkilo);
    const disabled = isVahvastiYksiloity(henkilo);
    const { data } = useGetKansalaisuudetQuery();
    const options = useMemo(() => {
        return (
            data?.map((koodi) => ({
                value: koodi.koodiArvo.toLowerCase(),
                label: localizeKoodiNimi(koodi, locale),
                optionsName: 'kansalaisuus',
            })) ?? []
        );
    }, [data]);
    return (
        <div>
            <FieldlessLabelValue readOnly={props.readOnly} label="HENKILO_KANSALAISUUS">
                {props.readOnly ? (
                    options
                        .filter((o) => !!kansalaisuus.find((k) => k.kansalaisuusKoodi === o.value))
                        .map((k) => k.label)
                        .join(', ')
                ) : (
                    <Select
                        options={options}
                        isMulti={true}
                        isDisabled={disabled}
                        value={options.filter((o) => !!kansalaisuus.find((k) => k.kansalaisuusKoodi === o.value))}
                        onChange={(newOption) => {
                            if (newOption === null) {
                                props.updateModelSelectAction({
                                    optionsName: 'kansalaisuus',
                                    value: kansalaisuus,
                                });
                            } else {
                                props.updateModelSelectAction({
                                    optionsName: 'kansalaisuus',
                                    value: newOption.map((kansalaisuusOption) => ({
                                        kansalaisuusKoodi: kansalaisuusOption.value,
                                    })),
                                });
                            }
                        }}
                    />
                )}
            </FieldlessLabelValue>
        </div>
    );
};

export default Kansalaisuus;
