import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import StaticUtils from "../../StaticUtils";

const YksiloiHetutonButton = ({henkilo, L, yksiloiAction}) =>
    !henkilo.henkilo.yksiloityVTJ && !henkilo.henkilo.hetu
        ? <ConfirmButton key="yksilointi" big action={() => yksiloiAction(henkilo.henkilo.oidHenkilo)}
                         normalLabel={L['YKSILOI_LINKKI']} confirmLabel={L['YKSILOI_LINKKI_CONFIRM']}
                         errorMessage={StaticUtils.createPopupErrorMessage('yksiloi', henkilo, L)} />
        : null;

YksiloiHetutonButton.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        yksiloityVTJ: React.PropTypes.bool,
        hetu: React.PropTypes.string,
        oidHenkilo: React.PropTypes.string,
    })}),
    L: React.PropTypes.object,
    yksiloiAction: React.PropTypes.func.isRequired,
};

export default YksiloiHetutonButton;
