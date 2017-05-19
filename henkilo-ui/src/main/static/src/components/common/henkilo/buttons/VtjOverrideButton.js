import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import StaticUtils from "../../StaticUtils";

const VtjOverrideButton = ({henkilo, L, overrideAction}) =>{
    console.log();
    return     henkilo.henkilo.yksiloityVTJ && henkilo.henkilo.hetu
        ? <ConfirmButton key="vtjOverride" big action={() => overrideAction(henkilo.henkilo.oidHenkilo)}
                         normalLabel={L['VTJ_OVERRIDE_LINKKI']} confirmLabel={L['VTJ_OVERRIDE_LINKKI_CONFIRM']}
                         errorMessage={StaticUtils.createPopupErrorMessage('vtjOverride', henkilo, L)} />
        : null;

};

VtjOverrideButton.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        yksiloityVTJ: React.PropTypes.bool,
        hetu: React.PropTypes.string,
        oidHenkilo: React.PropTypes.string,
    })}),
    L: React.PropTypes.object,
    overrideAction: React.PropTypes.func.isRequired,
};

export default VtjOverrideButton;
