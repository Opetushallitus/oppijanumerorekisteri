import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import type { RootState } from '../../../../store';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { NamedSelectOption } from '../../../../utilities/select';
import { useLocalisations } from '../../../../selectors';
import { useGetKieletQuery } from '../../../../api/koodisto';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (o: NamedSelectOption) => void;
};

const Aidinkieli = (props: OwnProps) => {
    const { locale } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data } = useGetKieletQuery();
    const options = useMemo(() => {
        return (
            data?.map((koodi) => ({
                value: koodi.koodiArvo.toLowerCase(),
                label: StaticUtils.localizeKoodiNimi(koodi, locale),
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
                    isDisabled={StaticUtils.hasHetuAndIsYksiloity(henkilo)}
                />
            )}
        </FieldlessLabelValue>
    );
};

export default Aidinkieli;
