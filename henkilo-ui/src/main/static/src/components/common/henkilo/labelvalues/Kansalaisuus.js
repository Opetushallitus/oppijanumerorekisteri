// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {Locale} from "../../../../types/locale.type";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {ReactSelectOption} from "../../../../types/react-select.types";
import IconButton from "../../button/IconButton";
import CrossIcon from "../../icons/CrossIcon";

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        kansalaisuus: Array<ReactSelectOption>,
    },
    locale: Locale,
    henkiloUpdate: Henkilo,
    readOnly: boolean,
    updateModelFieldAction: ({}) => void,
}

const Kansalaisuus = (props: Props) => {
    const kansalaisuus = (props.henkiloUpdate && props.henkiloUpdate.kansalaisuus) || [];
    const disabled = StaticUtils.hasHetuAndIsYksiloity(props.henkilo);
    return <div>
        {kansalaisuus.map((values, idx) => <span>
            <LabelValue
                key={idx}
                readOnly={props.readOnly}
                updateModelFieldAction={props.updateModelFieldAction}
                values={{
                    label: 'HENKILO_KANSALAISUUS',
                    data: props.koodisto.kansalaisuus.map(koodi => ({
                        value: koodi.value,
                        label: koodi[props.locale],
                        optionsName: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                    })),
                    value: props.koodisto.kansalaisuus
                        .filter(kansalaisuus => kansalaisuus.value === values.kansalaisuusKoodi)[0][props.locale],
                    selectValue: props.henkiloUpdate.kansalaisuus[idx].kansalaisuusKoodi,
                    disabled: disabled,
                }}
            >
                {!props.readOnly
                && <IconButton onClick={() => props.updateModelFieldAction({optionsName: 'kansalaisuus', value: kansalaisuus.filter(((kansalaisuus, kIdx) => kIdx !== idx))})}>
                    <CrossIcon/>
                </IconButton>}
            </LabelValue>
            </span>
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
                value: null,
                selectValue: props.henkiloUpdate.kansalaisuus[kansalaisuus.length] && props.henkiloUpdate.kansalaisuus[kansalaisuus.length].kansalaisuusKoodi,
                disabled: disabled,
            }}
        />}
    </div>;
};

Kansalaisuus.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
            kansalaisuus: PropTypes.array,
            yksiloityVTJ: PropTypes.bool,
        })}),
    koodisto: PropTypes.shape({
        kansalaisuus: PropTypes.array,
    }),
    locale: PropTypes.string,
    henkiloUpdate: PropTypes.shape({
        kansalaisuus: PropTypes.arrayOf(
            PropTypes.shape({
                kansalalaisuusKoodi: PropTypes.string,
            })
        )
    }),
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect(mapStateToProps, {})(Kansalaisuus);
