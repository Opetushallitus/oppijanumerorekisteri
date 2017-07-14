import React from 'react'
import PropTypes from 'prop-types'
import ConfirmButton from "../../button/ConfirmButton";

const VtjOverrideButton = ({henkilo, L, overrideAction}) =>{
    console.log();
    return henkilo.henkilo.yksiloityVTJ && henkilo.henkilo.hetu
        ? <ConfirmButton key="vtjOverride"
                         action={() => overrideAction(henkilo.henkilo.oidHenkilo)}
                         normalLabel={L['VTJ_OVERRIDE_LINKKI']}
                         confirmLabel={L['VTJ_OVERRIDE_LINKKI_CONFIRM']}
                         id="vtjOverride" />
        : null;
};

VtjOverrideButton.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        yksiloityVTJ: PropTypes.bool,
        hetu: PropTypes.string,
        oidHenkilo: PropTypes.string,
    })}),
    L: PropTypes.object,
    overrideAction: PropTypes.func.isRequired,
};

export default VtjOverrideButton;
