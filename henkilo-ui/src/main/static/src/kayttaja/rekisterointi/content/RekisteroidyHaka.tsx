import React from 'react';

import type { Localisations } from '../../../types/localisation.type';
import Asiointikieli from '../../../components/common/henkilo/labelvalues/Asiointikieli';
import IconButton from '../../../components/common/button/IconButton';
import HakaIcon from '../../../components/common/icons/HakaIcon';

type OwnProps = {
    henkilo: {
        henkilo: {
            etunimet: string;
            sukunimi: string;
            kutsumanimi: string;
        };
        username?: string;
        password?: string;
        passwordAgain?: string;
    };
    updatePayloadModel: () => void;
    temporaryKutsuToken: string;
    L: Localisations;
};

const RekisteroidyPerustiedot = (props: OwnProps) => {
    const hakaLoginUrl = `/cas/login?forceIdp=haka&service=https%3A%2F%2F${window.location.hostname}%2Fkayttooikeus-service%2FhakaRegistrationTemporaryToken%2F${props.temporaryKutsuToken}`;
    return (
        <div>
            <p className="oph-h3 oph-bold">{props.L['REKISTEROIDY_HAKA_OTSIKKO']}</p>
            <Asiointikieli henkiloUpdate={props.henkilo.henkilo} updateModelFieldAction={props.updatePayloadModel} />
            <IconButton href={hakaLoginUrl}>
                <HakaIcon />
            </IconButton>
        </div>
    );
};

export default RekisteroidyPerustiedot;
