import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import Button from "../../button/Button";

const PassivoiOrganisaatioButton = ({passive, id, L, passivoiOrgAction, disabled}) => !passive
    ? <ConfirmButton key="passivoiOrg"
                     cancel
                     action={() => passivoiOrgAction(id)}
                     confirmLabel={L['HENKILO_ORG_PASSIVOI_CONFIRM']}
                     normalLabel={L['HENKILO_ORG_PASSIVOI']}
                     id={id}
                     disabled={disabled} />
    : <Button disabled action={() => {}}>{L['HENKILO_ORG_PASSIVOITU']}</Button>;

PassivoiOrganisaatioButton.propTypes = {
    passive: React.PropTypes.bool.isRequired,
    id: React.PropTypes.string.isRequired,
    L: React.PropTypes.object.isRequired,
    passivoiOrgAction: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool,
};

export default PassivoiOrganisaatioButton;
