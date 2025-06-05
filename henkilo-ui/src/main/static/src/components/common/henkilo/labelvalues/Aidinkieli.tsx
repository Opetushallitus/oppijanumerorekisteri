import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import type { RootState } from '../../../../store';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Locale } from '../../../../types/locale.type';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';
import { NamedSelectOption } from '../../../../utilities/select';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelSelectAction: (o: NamedSelectOption) => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    locale: Locale;
};

type Props = OwnProps & StateProps;

const Aidinkieli = (props: Props) => {
    const options = useMemo(() => {
        return (
            props.koodisto.kieli?.map((koodi) => ({
                value: koodi.value,
                label: koodi[props.locale],
                optionsName: 'aidinkieli.kieliKoodi',
            })) ?? []
        );
    }, [props.koodisto]);

    return (
        <FieldlessLabelValue readOnly={props.readOnly} label="HENKILO_AIDINKIELI">
            {props.readOnly ? (
                options.find((o) => o.value === props.henkiloUpdate.aidinkieli?.kieliKoodi)?.label
            ) : (
                <Select
                    options={options}
                    value={options.find((o) => o.value === props.henkiloUpdate.aidinkieli?.kieliKoodi)}
                    onChange={props.updateModelSelectAction}
                    isDisabled={StaticUtils.hasHetuAndIsYksiloity(props.henkilo)}
                />
            )}
        </FieldlessLabelValue>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(Aidinkieli);
