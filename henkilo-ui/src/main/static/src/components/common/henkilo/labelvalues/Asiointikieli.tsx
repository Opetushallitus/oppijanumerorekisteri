import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import type { Option, Options } from 'react-select';
import { Locale } from '../../../../types/locale.type';

type OwnProps = {
    henkiloUpdate: { asiointiKieli?: { kieliKoodi?: string } };
    readOnly?: boolean;
    updateModelFieldAction: (arg0: Option<string> & React.SyntheticEvent<HTMLInputElement>) => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: {
        kieli: Options<string>;
    };
    locale: Locale;
};

type Props = OwnProps & StateProps;

const Asiointikieli = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: 'HENKILO_ASIOINTIKIELI',
            data: props.koodisto.kieli
                .filter((koodi) => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
                .map((koodi) => ({
                    value: koodi.value,
                    label: koodi[props.locale],
                    optionsName: 'asiointiKieli.kieliKoodi',
                })),
            selectValue: props.henkiloUpdate.asiointiKieli && props.henkiloUpdate.asiointiKieli.kieliKoodi,
        }}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    locale: state.locale,
    koodisto: state.koodisto,
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Asiointikieli);
