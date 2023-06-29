import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import type { Options } from 'react-select';
import { Locale } from '../../../../types/locale.type';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelFieldAction: () => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: {
        kieli: Options<string>;
    };
    locale: Locale;
};

type Props = OwnProps & StateProps;

const Aidinkieli = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: 'HENKILO_AIDINKIELI',
            data: props.koodisto.kieli.map((koodi) => ({
                value: koodi.value,
                label: koodi[props.locale],
                optionsName: 'aidinkieli.kieliKoodi',
            })),
            selectValue: props.henkiloUpdate.aidinkieli && props.henkiloUpdate.aidinkieli.kieliKoodi,
            disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(Aidinkieli);
