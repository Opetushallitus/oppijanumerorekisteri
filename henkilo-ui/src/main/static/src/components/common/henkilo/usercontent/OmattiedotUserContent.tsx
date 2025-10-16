import React, { SyntheticEvent, useMemo } from 'react';

import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import Etunimet from '../labelvalues/Etunimet';
import Kutsumanimi from '../labelvalues/Kutsumanimi';
import Oid from '../labelvalues/Oid';
import Oppijanumero from '../labelvalues/Oppijanumero';
import Asiointikieli from '../labelvalues/Asiointikieli';
import EditButton from '../buttons/EditButton';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import PasswordButton from '../buttons/PasswordButton';
import Syntymaaika from '../labelvalues/Syntymaaika';
import Hetu from '../labelvalues/Hetu';
import Kansalaisuus from '../labelvalues/Kansalaisuus';
import Aidinkieli from '../labelvalues/Aidinkieli';
import Sukupuoli from '../labelvalues/Sukupuoli';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { AnomusIlmoitus } from '../labelvalues/AnomusIlmoitus';
import HenkiloVarmentajaSuhde from '../labelvalues/HenkiloVarmentajaSuhde';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../../api/kayttooikeus';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

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

const OmattiedotUserContent = (props: OwnProps) => {
    const { isLoading: isHenkiloLoading } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot, isLoading } = useGetKayttajatiedotQuery(props.oidHenkilo);

    const showAnomusIlmoitus = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, ['KAYTTOOIKEUS_REKISTERINPITAJA']);
    }, [omattiedot]);

    const createBasicInfo = () => {
        return [
            [
                <Etunimet
                    key="omattiedot-etunimet"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Sukunimi
                    key="omattiedot-sukunimi"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Syntymaaika
                    key="omattiedot-syntymaaika"
                    readOnly={props.readOnly}
                    updateDateFieldAction={props.updateDateAction}
                    henkiloUpdate={props.henkiloUpdate}
                />,
                <Hetu
                    key="omattiedot-hetu"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Kutsumanimi
                    key="omattiedot-kutsumanimi"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
            ],
            [
                <Kansalaisuus
                    key="omattiedot-kansalaisuus"
                    readOnly={props.readOnly}
                    updateModelSelectAction={props.updateModelSelectAction}
                    henkiloUpdate={props.henkiloUpdate}
                />,
                <Aidinkieli
                    key="omattiedot-aidinkieli"
                    readOnly={props.readOnly}
                    updateModelSelectAction={props.updateModelSelectAction}
                    henkiloUpdate={props.henkiloUpdate}
                />,
                <Sukupuoli
                    key="omattiedot-sukupuoli"
                    readOnly={props.readOnly}
                    updateModelSelectAction={props.updateModelSelectAction}
                    henkiloUpdate={props.henkiloUpdate}
                />,
                <Oppijanumero
                    key="omattiedot-oppijanumero"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Oid
                    key="omattiedot-oid"
                    henkiloOid={props.oidHenkilo}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Asiointikieli
                    key="omattiedot-asiointikieli"
                    readOnly={props.readOnly}
                    updateModelSelectAction={props.updateModelSelectAction}
                    henkiloUpdate={props.henkiloUpdate}
                />,
            ],
            [
                <Kayttajanimi
                    key="omattiedot-kayttajanimi"
                    kayttajatiedot={kayttajatiedot}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                    disabled={true}
                />,
                showAnomusIlmoitus ? (
                    <AnomusIlmoitus
                        key="omattiedot-anomusilmoitus"
                        readOnly={props.readOnly}
                        updateModelSelectAction={props.updateModelSelectAction}
                        henkiloUpdate={props.henkiloUpdate}
                    />
                ) : null,
                <HenkiloVarmentajaSuhde
                    key="omattiedot-henkiloVarmentajas"
                    oidHenkilo={omattiedot?.oidHenkilo}
                    type="henkiloVarmentajas"
                />,
                <HenkiloVarmentajaSuhde
                    key="omattiedot-henkiloVarmennettavas"
                    oidHenkilo={omattiedot?.oidHenkilo}
                    type="henkiloVarmennettavas"
                />,
            ],
        ];
    };

    const createReadOnlyButtons = () => {
        return [
            <EditButton key="editbutton" editAction={props.edit} disabled={false} />,
            <PasswordButton
                key="passwordbutton"
                oidHenkilo={omattiedot?.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={false}
            />,
        ];
    };

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
};

export default OmattiedotUserContent;
