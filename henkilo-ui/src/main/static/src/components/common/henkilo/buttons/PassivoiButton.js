import React from 'react'
import PropTypes from 'prop-types'
import ConfirmButton from "../../button/ConfirmButton";
import Button from "../../button/Button";

const PassivoiButton = ({henkilo, passivoiAction, L}) => henkilo.henkilo.passivoitu
    ? <Button key="passivoi" disabled action={() => {}}>{L['PASSIVOI_PASSIVOITU']}</Button>
    : <ConfirmButton key="passivoi"
                     action={() => passivoiAction(henkilo.henkilo.oidHenkilo)}
                     normalLabel={L['PASSIVOI_LINKKI']}
                     confirmLabel={L['PASSIVOI_LINKKI_CONFIRM']}
                     id="passivoi" />;

PassivoiButton.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        passivoitu: PropTypes.bool,
        oidHenkilo: PropTypes.string,
    })}),
    L: PropTypes.object,
    passivoiAction: PropTypes.func.isRequired,
};

export default PassivoiButton;