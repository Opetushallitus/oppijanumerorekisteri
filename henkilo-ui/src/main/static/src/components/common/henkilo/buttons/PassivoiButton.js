import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import Button from "../../button/Button";
import StaticUtils from "../../StaticUtils";

const PassivoiButton = ({henkilo, passivoiAction, L}) => henkilo.henkilo.passivoitu
    ? <Button key="passivoi" big disabled action={() => {}}>{L['PASSIVOI_PASSIVOITU']}</Button>
    : <ConfirmButton key="passivoi" big action={() => passivoiAction(henkilo.henkilo.oidHenkilo)}
                     normalLabel={L['PASSIVOI_LINKKI']} confirmLabel={L['PASSIVOI_LINKKI_CONFIRM']}
                     errorMessage={StaticUtils.createPopupErrorMessage('passivoi', henkilo, L)} />;

PassivoiButton.propTypes = {
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        passivoitu: React.PropTypes.bool,
        oidHenkilo: React.PropTypes.string,
    })}),
    L: React.PropTypes.object,
    passivoiAction: React.PropTypes.func.isRequired,
};

export default PassivoiButton;