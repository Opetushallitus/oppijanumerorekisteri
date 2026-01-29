import React, { SyntheticEvent, useMemo } from 'react';
import { SingleValue } from 'react-select';

import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import Etunimet from '../labelvalues/Etunimet';
import Kutsumanimi from '../labelvalues/Kutsumanimi';
import Oid from '../labelvalues/Oid';
import Oppijanumero from '../labelvalues/Oppijanumero';
import Asiointikieli from '../labelvalues/Asiointikieli';
import EditButton from '../buttons/EditButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import HakaButton from '../buttons/HakaButton';
import PasswordButton from '../buttons/PasswordButton';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../../api/kayttooikeus';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => Promise<void>;
    updateModelAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    updateModelSelectAction: (o: SingleValue<NamedSelectOption> | NamedMultiSelectOption) => void;
    updateDateAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    oidHenkilo: string;
    isValidForm: boolean;
};

function VirkailijaUserContent(props: OwnProps) {
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot, isLoading } = useGetKayttajatiedotQuery(props.oidHenkilo);

    const hasHenkiloReadUpdateRights = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
    }, [omattiedot]);

    function createBasicInfo() {
        const infoProps = {
            readOnly: props.readOnly,
            henkiloOid: props.oidHenkilo,
            updateModelFieldAction: props.updateModelAction,
            updateModelSelectAction: props.updateModelSelectAction,
            updateDateFieldAction: props.updateDateAction,
            henkiloUpdate: props.henkiloUpdate,
            kayttajatiedot,
        };

        // Basic info box content
        return [
            [
                <Sukunimi key="virkailija-sukunimi" autofocus={true} {...infoProps} />,
                <Etunimet key="virkailija-etunimet" {...infoProps} />,
                <Kutsumanimi key="virkailija-kutsumanimi" {...infoProps} />,
                <Asiointikieli key="virkailija-asiointikieli" {...infoProps} />,
            ],
            [
                <Oppijanumero key="virkailija-oppijanumero" {...infoProps} />,
                <Oid key="virkailija-oid" {...infoProps} />,
            ],
            [
                <Kayttajanimi key="virkailija-kayttajanimi" {...infoProps} disabled={true} />,
                <LinkitetytHenkilot key="virkailija-linkitetyt" henkiloOid={props.oidHenkilo} />,
                <MasterHenkilo key="virkailija-master" oidHenkilo={props.oidHenkilo} />,
            ],
        ];
    }

    function createReadOnlyButtons() {
        const duplicate = henkilo?.duplicate;
        const passivoitu = henkilo?.passivoitu;
        const kayttajatunnukseton = !kayttajatiedot?.username;
        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const hakaButton = (
            <HakaButton
                oidHenkilo={props.oidHenkilo}
                styles={{
                    left: '0px',
                    top: '3rem',
                    width: '350px',
                    padding: '30px',
                }}
                disabled={duplicate || passivoitu}
            />
        );
        const passwordButton = (
            <PasswordButton
                oidHenkilo={props.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />
        );

        return [editButton, hakaButton, passwordButton];
    }
    return isHenkiloLoading || isLoading ? (
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
}

export default VirkailijaUserContent;
