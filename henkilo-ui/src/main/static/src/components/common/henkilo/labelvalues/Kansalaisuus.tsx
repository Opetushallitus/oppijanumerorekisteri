import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import type { RootState } from '../../../../store';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Locale } from '../../../../types/locale.type';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';
import { NamedMultiSelectOption } from '../../../../utilities/select';
import { FieldlessLabelValue } from './FieldlessLabelValue';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (arg0: NamedMultiSelectOption) => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    locale: Locale;
};

type Props = OwnProps & StateProps;

const Kansalaisuus = (props: Props) => {
    const kansalaisuus = props.henkiloUpdate.kansalaisuus || [];
    const disabled = StaticUtils.hasHetuAndIsYksiloity(props.henkilo);

    const options = useMemo(() => {
        return (
            props.koodisto.kansalaisuus?.map((koodi) => ({
                value: koodi.value,
                label: koodi[props.locale],
                optionsName: 'kansalaisuus',
            })) ?? []
        );
    }, [kansalaisuus]);
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

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Kansalaisuus);
