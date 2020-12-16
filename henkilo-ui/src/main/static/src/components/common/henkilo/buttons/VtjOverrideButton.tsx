import React from 'react';
import { connect } from 'react-redux';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { overrideHenkiloVtjData } from '../../../../actions/henkilo.actions';

type OwnProps = {
    disabled?: boolean;
};

type Props = OwnProps & {
    henkilo: HenkiloState;
    L: Localisations;
    overrideHenkiloVtjData: (arg0: string) => void;
};

const VtjOverrideButton = (props: Props) => {
    return props.henkilo.henkilo.yksiloityVTJ && props.henkilo.henkilo.hetu ? (
        <ConfirmButton
            key="vtjOverride"
            action={() => props.overrideHenkiloVtjData(props.henkilo.henkilo.oidHenkilo)}
            normalLabel={props.L['VTJ_OVERRIDE_LINKKI']}
            confirmLabel={props.L['VTJ_OVERRIDE_LINKKI_CONFIRM']}
            id="vtjOverride"
            disabled={props.disabled}
        />
    ) : null;
};

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps>(mapStateToProps, {
    overrideHenkiloVtjData,
})(VtjOverrideButton);
