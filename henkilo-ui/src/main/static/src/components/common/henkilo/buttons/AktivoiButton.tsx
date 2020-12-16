import React from 'react';
import { Localisations } from '../../../../types/localisation.type';
import ConfirmButton from '../../button/ConfirmButton';

type Props = {
    L: Localisations;
    oid: string;
    onClick: (arg0: string) => void;
};

const AktivoiButton = (props: Props) => (
    <ConfirmButton
        key="aktivoi"
        action={() => props.onClick(props.oid)}
        normalLabel={props.L['AKTIVOI_LINKKI']}
        confirmLabel={props.L['AKTIVOI_LINKKI_CONFIRM']}
        id="aktivoi"
    />
);

export default AktivoiButton;
