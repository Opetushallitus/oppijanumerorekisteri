import React, { SyntheticEvent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../../store';
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
import PassivoiButton from '../buttons/PassivoiButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import PuraHetuttomanYksilointiButton from '../buttons/PuraHetuttomanYksilointi';
import HakaButton from '../buttons/HakaButton';
import VtjOverrideButton from '../buttons/VtjOverrideButton';
import PasswordButton from '../buttons/PasswordButton';
import AktivoiButton from '../buttons/AktivoiButton';
import { hasAnyPalveluRooli, isOnrRekisterinpitaja } from '../../../../utilities/palvelurooli.util';
import Sukupuoli from '../labelvalues/Sukupuoli';
import PassinumeroButton from '../buttons/PassinumeroButton';
import PoistaKayttajatunnusButton from '../buttons/PoistaKayttajatunnusButton';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../../api/kayttooikeus';
import StaticUtils from '../../StaticUtils';

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

function AdminUserContent(props: OwnProps) {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot, isLoading } = useGetKayttajatiedotQuery(props.oidHenkilo);

    const hasHenkiloReadUpdateRights = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
    }, [omattiedot]);
    const isRekisterinpitaja = useMemo(() => {
        return isOnrRekisterinpitaja(omattiedot?.organisaatiot);
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
                <Sukunimi key="admin-sukunimi" {...infoProps} autofocus={true} />,
                <Etunimet key="admin-etunimi" {...infoProps} />,
                <Syntymaaika key="admin-syntymaaika" {...infoProps} />,
                <Hetu key="admin-hetu" {...infoProps} />,
                <Kutsumanimi key="admin-kutsumanimi" {...infoProps} />,
            ],
            [
                <Kansalaisuus key="admin-kansalaisuus" {...infoProps} />,
                <Aidinkieli key="admin-aidinkieli" {...infoProps} />,
                <Sukupuoli key="admin-sukupuoli" {...infoProps} />,
                <Oppijanumero key="admin-oppijanumero" {...infoProps} />,
                <Oid key="admin-oid" {...infoProps} />,
                <Asiointikieli key="admin-asiointikieli" {...infoProps} />,
            ],
            [
                <Kayttajanimi
                    key="admin-kayttajanimi"
                    {...infoProps}
                    kayttajatiedot={kayttajatiedot}
                    disabled={!omattiedot?.isAdmin || !kayttajatiedot?.username}
                />,
                <LinkitetytHenkilot key="admin-linkitetythenkilot" />,
                <MasterHenkilo key="admin-masterhenkilo" oidHenkilo={props.oidHenkilo} />,
            ],
        ];
    }

    function createReadOnlyButtons() {
        const buttonPopupStyles = {
            left: '0px',
            top: '3rem',
            width: '15rem',
            padding: '30px',
        };
        const duplicate = henkilo.henkilo.duplicate;
        const passivoitu = henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !kayttajatiedot?.username;
        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const yksiloiHetutonButton = <YksiloiHetutonButton disabled={duplicate || passivoitu} />;
        const puraHetuttomanYksilointiButton =
            henkilo.henkilo.yksiloity && !StaticUtils.isVahvastiYksiloity(henkilo.henkilo) && !henkilo.henkilo.hetu ? (
                <PuraHetuttomanYksilointiButton disabled={duplicate || passivoitu} />
            ) : null;
        const passivoiButton =
            !passivoitu && hasHenkiloReadUpdateRights ? <PassivoiButton disabled={duplicate || passivoitu} /> : null;
        const poistaKayttajatunnusBtn =
            isRekisterinpitaja && !kayttajatunnukseton ? (
                <PoistaKayttajatunnusButton henkiloOid={henkilo.henkilo.oidHenkilo} />
            ) : null;
        const aktivoiButton =
            passivoitu && hasHenkiloReadUpdateRights ? <AktivoiButton oidHenkilo={henkilo.henkilo.oidHenkilo} /> : null;
        const hakaButton = (
            <HakaButton oidHenkilo={props.oidHenkilo} styles={buttonPopupStyles} disabled={duplicate || passivoitu} />
        );
        const passinumeroButton = isRekisterinpitaja ? (
            <PassinumeroButton oid={props.oidHenkilo} styles={buttonPopupStyles} />
        ) : null;
        const vtjOverrideButton = <VtjOverrideButton disabled={duplicate || passivoitu} />;
        const passwordButton = (
            <PasswordButton
                oidHenkilo={props.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />
        );

        return [
            editButton,
            yksiloiHetutonButton,
            puraHetuttomanYksilointiButton,
            passivoiButton,
            poistaKayttajatunnusBtn,
            aktivoiButton,
            hakaButton,
            passinumeroButton,
            vtjOverrideButton,
            passwordButton,
        ];
    }
    return henkilo.henkiloLoading || isLoading ? (
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

export default AdminUserContent;
