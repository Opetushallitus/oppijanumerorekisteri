import React from 'react'
import PropTypes from 'prop-types'
import ConfirmButton from "../../button/ConfirmButton";

const YksiloiHetutonButton = ({henkilo, L, yksiloiAction}) =>
    !henkilo.henkilo.yksiloityVTJ && !henkilo.henkilo.hetu
        ? <ConfirmButton key="yksilointi"
                         action={() => yksiloiAction(henkilo.henkilo.oidHenkilo)}
                         normalLabel={L['YKSILOI_LINKKI']}
                         confirmLabel={L['YKSILOI_LINKKI_CONFIRM']}
                         id="yksilointi" />
        : null;

YksiloiHetutonButton.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        yksiloityVTJ: PropTypes.bool,
        hetu: PropTypes.string,
        oidHenkilo: PropTypes.string,
    })}),
    L: PropTypes.object,
    yksiloiAction: PropTypes.func.isRequired,
};

export default YksiloiHetutonButton;
