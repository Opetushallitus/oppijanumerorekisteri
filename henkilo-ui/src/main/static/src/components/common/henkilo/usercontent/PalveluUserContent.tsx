import React, { SyntheticEvent } from 'react';

import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import EditButton from '../buttons/EditButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import Loader from '../../icons/Loader';
import Oid from '../labelvalues/Oid';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import PasswordButton from '../buttons/PasswordButton';
import PassivoiButton from '../buttons/PassivoiButton';
import AktivoiButton from '../buttons/AktivoiButton';
import PoistaKayttajatunnusButton from '../buttons/PoistaKayttajatunnusButton';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../../api/kayttooikeus';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => Promise<void>;
    updateModelAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    updateDateAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    oidHenkilo: string;
    isValidForm: boolean;
};

const PalveluUserContent = (props: OwnProps) => {
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(props.oidHenkilo);

    const createBasicInfo = () => {
        return [
            [
                <Sukunimi
                    key="palveluuser-sukunimi"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    autofocus={true}
                    label="HENKILO_PALVELUN_NIMI"
                />,
            ],
            [
                <Oid
                    key="palveluuser-oid"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Kayttajanimi
                    key="palveluuser-kayttajanimi"
                    kayttajatiedot={kayttajatiedot}
                    disabled={!omattiedot?.isAdmin && !!kayttajatiedot?.username}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
            ],
        ];
    };

    // Basic info default buttons
    const createReadOnlyButtons = () => {
        const duplicate = henkilo?.duplicate;
        const passivoitu = henkilo?.passivoitu;
        const kayttajatunnukseton = !kayttajatiedot?.username;
        return [
            <EditButton key="editbutton" editAction={props.edit} disabled={duplicate || passivoitu} />,
            omattiedot?.isAdmin ? (
                <PassivoiButton
                    henkiloOid={props.oidHenkilo}
                    passivoitu={!!henkilo?.passivoitu}
                    disabled={duplicate || passivoitu}
                />
            ) : null,
            omattiedot?.isAdmin && henkilo?.passivoitu ? <AktivoiButton oidHenkilo={henkilo?.oidHenkilo} /> : null,
            !kayttajatunnukseton && omattiedot?.isAdmin && henkilo ? (
                <PoistaKayttajatunnusButton henkiloOid={henkilo.oidHenkilo} />
            ) : null,
            <PasswordButton
                key="passwordbutton"
                oidHenkilo={props.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />,
        ];
    };

    return isHenkiloLoading ? (
        <Loader />
    ) : (
        <AbstractUserContent
            readOnly={props.readOnly}
            discardAction={props.discardAction}
            updateAction={props.updateAction}
            basicInfo={createBasicInfo()}
            readOnlyButtons={createReadOnlyButtons()}
            isValidForm={props.isValidForm}
        />
    );
};

export default PalveluUserContent;
