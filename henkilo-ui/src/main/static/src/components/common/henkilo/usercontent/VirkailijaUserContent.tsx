import React, { SyntheticEvent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import Etunimet from '../labelvalues/Etunimet';
import Kutsumanimi from '../labelvalues/Kutsumanimi';
import Oid from '../labelvalues/Oid';
import Oppijanumero from '../labelvalues/Oppijanumero';
import Asiointikieli from '../labelvalues/Asiointikieli';
import EditButton from '../buttons/EditButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import HakaButton from '../buttons/HakaButton';
import PasswordButton from '../buttons/PasswordButton';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetOmattiedotQuery } from '../../../../api/kayttooikeus';
import { RootState } from '../../../../store';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
    updateModelAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    updateModelSelectAction: (o: NamedSelectOption | NamedMultiSelectOption) => void;
    updateDateAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    oidHenkilo: string;
    isValidForm: boolean;
};

function VirkailijaUserContent(props: OwnProps) {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();

    const hasHenkiloReadUpdateRights = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
    }, [omattiedot]);

    function createBasicInfo() {
        const infoProps = {
            readOnly: props.readOnly,
            updateModelFieldAction: props.updateModelAction,
            updateModelSelectAction: props.updateModelSelectAction,
            updateDateFieldAction: props.updateDateAction,
            henkiloUpdate: props.henkiloUpdate,
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
                <LinkitetytHenkilot key="virkailija-linkitetyt" />,
                <MasterHenkilo key="virkailija-master" oidHenkilo={props.oidHenkilo} />,
            ],
        ];
    }

    function createReadOnlyButtons() {
        const duplicate = henkilo.henkilo.duplicate;
        const passivoitu = henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !henkilo.kayttajatieto?.username;
        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const hakaButton = (
            <HakaButton
                oidHenkilo={props.oidHenkilo}
                styles={{
                    left: '0px',
                    top: '3rem',
                    width: '15rem',
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
    return henkilo.henkiloLoading || henkilo.kayttajatietoLoading ? (
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
