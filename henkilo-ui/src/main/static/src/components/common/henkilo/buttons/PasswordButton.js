import React from 'react'
import Button from "../../button/Button";

const PasswordButton = ({L}) => <Button key="password" big action={() => {}}>{L['SALASANA_ASETA']}</Button>;

PasswordButton.propTypes = {
    L: React.PropTypes.object,
};

export default PasswordButton;
