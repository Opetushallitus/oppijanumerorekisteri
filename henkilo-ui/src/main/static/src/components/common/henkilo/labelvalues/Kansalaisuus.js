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

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        kansalaisuus: Array<ReactSelectOption>,
    },
    locale: Locale,
    henkiloUpdate: Henkilo,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Kansalaisuus = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={
        props.henkilo.henkilo.kansalaisuus && props.henkilo.henkilo.kansalaisuus.length
            ? props.henkilo.henkilo.kansalaisuus.map((values, idx) =>
                ({
                    label: 'HENKILO_KANSALAISUUS',
                    data: props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[props.locale],
                        optionsName: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',})),
                    value: props.koodisto.kansalaisuus
                        .filter(kansalaisuus => kansalaisuus.value === values.kansalaisuusKoodi)[0][props.locale],
                    selectValue: props.henkiloUpdate.kansalaisuus[idx].kansalaisuusKoodi,
                    disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
                })).reduce((a,b) => a.concat(b))
            : {
                label: 'HENKILO_KANSALAISUUS',
                data: props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[props.locale],
                    optionsName: 'kansalaisuus.0.kansalaisuusKoodi'})),
                value: null,
                disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
            }
    }
/>;

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
