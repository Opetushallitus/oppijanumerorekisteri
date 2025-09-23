import React, { SyntheticEvent } from 'react';
import { connect } from 'react-redux';
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
import { Localisations } from '../../../../types/localisation.type';
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
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import Sukupuoli from '../labelvalues/Sukupuoli';
import PassinumeroButton from '../buttons/PassinumeroButton';
import PoistaKayttajatunnusButton from '../buttons/PoistaKayttajatunnusButton';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useGetYhteystietotyypitQuery } from '../../../../api/koodisto';

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

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
    isAdmin: boolean;
    omattiedot: OmattiedotState;
    translate: (key: string) => string;
};

type Props = OwnProps & StateProps;

function AdminUserContent(props: Props) {
    const yhteystietotyypitQuery = useGetYhteystietotyypitQuery();

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
                    disabled={!props.isAdmin || !props.henkilo.kayttajatieto?.username}
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
        const duplicate = props.henkilo.henkilo.duplicate;
        const passivoitu = props.henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !props.henkilo.kayttajatieto?.username;
        const hasHenkiloReadUpdateRights: boolean = hasAnyPalveluRooli(props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
        const isRekisterinpitaja = isOnrRekisterinpitaja(props.omattiedot.organisaatiot);
        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const yksiloiHetutonButton = <YksiloiHetutonButton disabled={duplicate || passivoitu} />;
        const puraHetuttomanYksilointiButton =
            props.henkilo.henkilo.yksiloity && !props.henkilo.henkilo.hetu && !props.henkilo.henkilo.yksiloityVTJ ? (
                <PuraHetuttomanYksilointiButton disabled={duplicate || passivoitu} />
            ) : null;
        const passivoiButton =
            !passivoitu && hasHenkiloReadUpdateRights ? <PassivoiButton disabled={duplicate || passivoitu} /> : null;
        const poistaKayttajatunnusBtn =
            isRekisterinpitaja && !kayttajatunnukseton ? <PoistaKayttajatunnusButton /> : null;
        const aktivoiButton =
            passivoitu && hasHenkiloReadUpdateRights ? (
                <AktivoiButton L={props.L} oidHenkilo={props.henkilo.henkilo.oidHenkilo} />
            ) : null;
        const hakaButton = (
            <HakaButton oidHenkilo={props.oidHenkilo} styles={buttonPopupStyles} disabled={duplicate || passivoitu} />
        );
        const passinumeroButton = isRekisterinpitaja ? (
            <PassinumeroButton
                oid={props.oidHenkilo}
                styles={buttonPopupStyles}
                translate={props.translate}
            ></PassinumeroButton>
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
    return props.henkilo.henkiloLoading || props.henkilo.kayttajatietoLoading || yhteystietotyypitQuery.isLoading ? (
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

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
    isAdmin: state.omattiedot.isAdmin,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, undefined, OwnProps, RootState>(mapStateToProps)(AdminUserContent);
