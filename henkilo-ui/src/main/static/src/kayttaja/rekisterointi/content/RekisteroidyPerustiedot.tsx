import React from 'react';
import { useSelector } from 'react-redux';

import type { KayttajaRootState } from '../../store';
import Etunimet from '../../../components/common/henkilo/labelvalues/Etunimet';
import Sukunimi from '../../../components/common/henkilo/labelvalues/Sukunimi';
import Kutsumanimi from '../../../components/common/henkilo/labelvalues/Kutsumanimi';
import Kayttajanimi from '../../../components/common/henkilo/labelvalues/Kayttajanimi';
import Salasana from '../../../components/common/henkilo/labelvalues/Salasana';
import Asiointikieli from '../../../components/common/henkilo/labelvalues/Asiointikieli';
import type { Localisations } from '../../../types/localisation.type';
import type { Notification } from '../../../reducers/notifications.reducer';

type OwnProps = {
    henkilo: {
        henkilo: {
            etunimet: string;
            sukunimi: string;
            kutsumanimi: string;
            asiointiKieli: {
                kieliKoodi: string;
            };
            kayttajanimi: string;
            password: string;
            passwordAgain: string;
        };
    };
    updatePayloadModel: (arg0: string) => void;
    koodisto: {
        kieli: Array<object>;
    };
    isUsernameError: boolean;
    isPasswordError: boolean;
    isLanguageError: boolean;
    isKutsumanimiError: boolean;
    L: Localisations;
};

const RekisteroidyPerustiedot = (props: OwnProps) => {
    const notifications = useSelector<KayttajaRootState, Notification[]>(
        (state) => state.notifications.buttonNotifications
    );

    function isKayttajanimiError() {
        return !!notifications.filter(
            (notification) =>
                notification.id === 'rekisteroidyPage' &&
                (notification.errorType === 'UsernameAlreadyExistsException' ||
                    notification.errorType === 'IllegalArgumentException')
        )[0];
    }

    function isSalasanaError() {
        return !!notifications.filter(
            (notification) => notification.id === 'rekisteroidyPage' && notification.errorType === 'PasswordException'
        )[0];
    }

    return (
        <div>
            {props.henkilo && (
                <div>
                    <p className="oph-h3 oph-bold">{props.L['REKISTEROIDY_PERUSTIEDOT']}</p>
                    <Etunimet readOnly={true} />
                    <Sukunimi readOnly={true} />
                    <Kutsumanimi
                        readOnly={false}
                        defaultValue={props.henkilo.henkilo.kutsumanimi}
                        updateModelFieldAction={props.updatePayloadModel}
                        isError={props.isKutsumanimiError}
                    />
                    <Kayttajanimi
                        disabled={false}
                        defaultValue={props.henkilo.henkilo.kayttajanimi}
                        updateModelFieldAction={props.updatePayloadModel}
                        isError={isKayttajanimiError() || props.isUsernameError}
                    />
                    <Salasana
                        disabled={false}
                        updateModelFieldAction={props.updatePayloadModel}
                        isError={isSalasanaError() || props.isPasswordError}
                    />
                    <Asiointikieli
                        henkiloUpdate={props.henkilo.henkilo}
                        updateModelFieldAction={props.updatePayloadModel}
                    />
                </div>
            )}
        </div>
    );
};

export default RekisteroidyPerustiedot;
