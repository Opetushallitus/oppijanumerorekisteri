// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {Locale} from "../../../../types/locale.type";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {ReactSelectOption} from "../../../../types/react-select.types";

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        kansalaisuus: Array<ReactSelectOption>,
    },
    locale: Locale,
    henkiloUpdate: Henkilo,
    readOnly: boolean,
    updateModelFieldAction: (any) => void,
}

const Kansalaisuus = (props: Props) => {
    const kansalaisuus = (props.henkiloUpdate && props.henkiloUpdate.kansalaisuus) || [];
    const disabled = StaticUtils.hasHetuAndIsYksiloity(props.henkilo);
    return <div>
        {kansalaisuus.map((values, idx) => <div>
            <LabelValue
                key={idx}
                readOnly={props.readOnly}
                updateModelFieldAction={(newOption: any) => {
                    if (newOption === null) {
                        props.updateModelFieldAction({optionsName: 'kansalaisuus', value: kansalaisuus.filter(((kansalaisuus, kIdx) => kIdx !== idx))});
                    }
                    else {
                        props.updateModelFieldAction({optionsName: newOption.optionsName, value: newOption.value});
                    }
                }}
                values={{
                    label: 'HENKILO_KANSALAISUUS',
                    data: props.koodisto.kansalaisuus.map(koodi => ({
                        value: koodi.value,
                        label: koodi[props.locale],
                        optionsName: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                    })),
                    selectValue: props.henkiloUpdate.kansalaisuus[idx].kansalaisuusKoodi,
                    disabled: disabled,
                    clearable: true,
                }}
            />
            </div>
        )}

        {!props.readOnly && <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_KANSALAISUUS',
                data: props.koodisto.kansalaisuus.map(koodi => ({
                    value: koodi.value,
                    label: koodi[props.locale],
                    optionsName: 'kansalaisuus.' + (kansalaisuus.length) + '.kansalaisuusKoodi',
                })),
                selectValue: props.henkiloUpdate.kansalaisuus[kansalaisuus.length] && props.henkiloUpdate.kansalaisuus[kansalaisuus.length].kansalaisuusKoodi,
                disabled: disabled,
            }}
        />}
    </div>;
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect(mapStateToProps, {})(Kansalaisuus);
