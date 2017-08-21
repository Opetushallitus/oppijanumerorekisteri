import React from 'react'
import PropTypes from 'prop-types'
import ConfirmButton from "../../button/ConfirmButton";

const PuraHetuttomanYksilointiButton = ({henkilo, L, puraYksilointiAction}) =>
    !henkilo.henkilo.yksiloityVTJ && !henkilo.henkilo.hetu && henkilo.henkilo.yksiloity ?
        <ConfirmButton key="purayksilointi"
                       action={() => puraYksilointiAction(henkilo.henkilo.oidHenkilo)}
                       normalLabel={L['PURA_YKSILOINTI_LINKKI']}
                       confirmLabel={L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
                       id="purayksilointi"/>
        : null;

PuraHetuttomanYksilointiButton.propTypes = {
    henkilo: PropTypes.shape({
        henkilo: PropTypes.shape({
            yksiloityVTJ: PropTypes.bool,
            yksiloity: PropTypes.bool,
            hetu: PropTypes.string,
            oidHenkilo: PropTypes.string
        }),
        L: PropTypes.object,
        puraYksilointiAction: PropTypes.func.isRequired
    })
};

export default PuraHetuttomanYksilointiButton;