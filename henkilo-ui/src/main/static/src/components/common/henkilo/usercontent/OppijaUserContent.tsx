import React, { SyntheticEvent, useMemo } from 'react';
import { SingleValue } from 'react-select';

import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import Etunimet from '../labelvalues/Etunimet';
import Syntymaaika from '../labelvalues/Syntymaaika';
import Hetu from '../labelvalues/Hetu';
import Kutsumanimi from '../labelvalues/Kutsumanimi';
import Kansalaisuus from '../labelvalues/Kansalaisuus';
import Aidinkieli from '../labelvalues/Aidinkieli';
import Oid from '../labelvalues/Oid';
import Oppijanumero from '../labelvalues/Oppijanumero';
import Asiointikieli from '../labelvalues/Asiointikieli';
import EditButton from '../buttons/EditButton';
import YksiloiHetutonButton from '../buttons/YksiloiHetutonButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import Loader from '../../icons/Loader';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import Sukupuoli from '../labelvalues/Sukupuoli';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetOmattiedotQuery } from '../../../../api/kayttooikeus';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
    updateModelAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    updateModelSelectAction: (o: SingleValue<NamedSelectOption> | NamedMultiSelectOption) => void;
    updateDateAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    oidHenkilo: string;
    isValidForm: boolean;
};

function OppijaUserContent(props: OwnProps) {
    const { data: henkilo, isLoading } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();

    const hasHenkiloReadUpdateRights = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
    }, [omattiedot]);
    const hasYksilointiRights = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
    }, [omattiedot]);

    function createBasicInfo() {
        const basicInfoProps = {
            readOnly: props.readOnly,
            updateModelFieldAction: props.updateModelAction,
            updateModelSelectAction: props.updateModelSelectAction,
            updateDateFieldAction: props.updateDateAction,
            henkiloUpdate: props.henkiloUpdate,
            henkiloOid: props.oidHenkilo,
        };
        const oid = henkilo?.oidHenkilo;

        // Basic info box content
        return [
            [
                <Sukunimi key={`sukunimi_${oid}`} autofocus {...basicInfoProps} />,
                <Etunimet key={`etunimet_${oid}`} {...basicInfoProps} />,
                <Syntymaaika key={`syntymaaika_${oid}`} {...basicInfoProps} />,
                <Hetu key={`hetu_${oid}`} {...basicInfoProps} />,
                <Kutsumanimi key={`kutsumanimi_${oid}`} {...basicInfoProps} />,
            ],
            [
                <Kansalaisuus key={`kansalaisuus_${oid}`} {...basicInfoProps} />,
                <Aidinkieli key={`aidinkieli_${oid}`} {...basicInfoProps} />,
                <Sukupuoli key={`sukupuoli_${oid}`} {...basicInfoProps} />,
                <Oppijanumero key={`oppijanumero_${oid}`} {...basicInfoProps} />,
                <Oid key={`oid_${oid}`} {...basicInfoProps} />,
                <Asiointikieli key={`asiointikieli_${oid}`} {...basicInfoProps} />,
            ],
            [
                <LinkitetytHenkilot key={`linkitetyt_${oid}`} henkiloOid={props.oidHenkilo} oppija={true} />,
                <MasterHenkilo key={`master_${oid}`} oidHenkilo={props.oidHenkilo} oppija={true} />,
            ],
        ];
    }

    function createReadOnlyButtons() {
        const duplicate = henkilo?.duplicate;
        const passivoitu = henkilo?.passivoitu;

        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const yksiloiHetutonButton = hasYksilointiRights ? (
            <YksiloiHetutonButton henkiloOid={props.oidHenkilo} disabled={duplicate || passivoitu} />
        ) : null;

        return [editButton, yksiloiHetutonButton];
    }
    return isLoading ? (
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

export default OppijaUserContent;
