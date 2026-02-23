import React, { useMemo } from 'react';
import Select, { SingleValue } from 'react-select';

import { isVahvastiYksiloity, localizeKoodiNimi } from '../../StaticUtils';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { NamedSelectOption } from '../../../../utilities/select';
import { useLocalisations } from '../../../../selectors';
import { useGetKieletQuery } from '../../../../api/koodisto';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (o: SingleValue<NamedSelectOption>) => void;
};

const Aidinkieli = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloUpdate.oidHenkilo);
    const { data } = useGetKieletQuery();
    const options = useMemo(() => {
        return (
            data?.map((koodi) => ({
                value: koodi.koodiArvo.toLowerCase(),
                label: localizeKoodiNimi(koodi, locale),
                optionsName: 'aidinkieli.kieliKoodi',
            })) ?? []
        );
    }, [data]);
    return (
        <FieldlessLabelValue readOnly={props.readOnly} label="HENKILO_AIDINKIELI">
            {props.readOnly ? (
                options.find((o) => o.value === props.henkiloUpdate.aidinkieli?.kieliKoodi)?.label
            ) : (
                <Select
                    options={options}
                    value={options.find((o) => o.value === props.henkiloUpdate.aidinkieli?.kieliKoodi)}
                    onChange={props.updateModelSelectAction}
                    isDisabled={isVahvastiYksiloity(henkilo)}
                />
            )}
        </FieldlessLabelValue>
    );
};

export default Aidinkieli;
