// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {ReactSelectOption} from "../../../../types/react-select.types";
import type {Locale} from "../../../../types/locale.type";

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        kieli: Array<ReactSelectOption>,
    },
    henkiloUpdate: any,
    readOnly?: boolean,
    locale: Locale,
    updateModelFieldAction: (string) => void,
}

const Asiointikieli = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_ASIOINTIKIELI',
        data: props.koodisto.kieli
            .filter(koodi => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
            .map(koodi => ({
                value: koodi.value,
                label: koodi[props.locale],
                optionsName: 'asiointiKieli.kieliKoodi',
            })),
        // For readOnly view
        value: props.henkilo && props.henkilo.henkilo && props.henkilo.henkilo.asiointiKieli && props.koodisto.kieli.length
        && props.koodisto.kieli
            .filter(kieli => kieli.value === props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][props.locale],
        // For edit view
        selectValue: props.henkiloUpdate.asiointiKieli && props.henkiloUpdate.asiointiKieli.kieliKoodi,
    }}
/>;

const mapStateToProps = (state) => ({
    locale: state.locale,
    koodisto: state.koodisto,
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Asiointikieli);
