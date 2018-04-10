// @flow
import React from 'react';
import {connect} from 'react-redux';
import AbstractUserContent from "./AbstractUserContent";
import Sukunimi from "../labelvalues/Sukunimi";
import Etunimet from "../labelvalues/Etunimet";
import Syntymaaika from "../labelvalues/Syntymaaika";
import Hetu from "../labelvalues/Hetu";
import Kutsumanimi from "../labelvalues/Kutsumanimi";
import Kansalaisuus from "../labelvalues/Kansalaisuus";
import Aidinkieli from "../labelvalues/Aidinkieli";
import Oppijanumero from "../labelvalues/Oppijanumero";
import Asiointikieli from "../labelvalues/Asiointikieli";
import EditButton from "../buttons/EditButton";
import YksiloiHetutonButton from "../buttons/YksiloiHetutonButton";
import PassivoiButton from "../buttons/PassivoiButton";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {L} from "../../../../types/localisation.type";
import type {Locale} from "../../../../types/locale.type";
import {fetchHenkiloSlaves, yksiloiHenkilo} from "../../../../actions/henkilo.actions";
import Loader from "../../icons/Loader";
import Kayttajanimi from "../labelvalues/Kayttajanimi";
import LinkitetytHenkilot from "../labelvalues/LinkitetytHenkilot";
import MasterHenkilo from "../labelvalues/MasterHenkilo";
import PuraHetuttomanYksilointiButton from "../buttons/PuraHetuttomanYksilointi";
import HakaButton from "../buttons/HakaButton";
import VtjOverrideButton from "../buttons/VtjOverrideButton";
import PasswordButton from "../buttons/PasswordButton";
import AktivoiButton from '../buttons/AktivoiButton';
import {hasAnyPalveluRooli} from "../../../../utilities/palvelurooli.util";
import type {OmattiedotState} from "../../../../reducers/omattiedot.reducer";

type Props = {
    readOnly: boolean,
    discardAction: () => void,
    updateAction: () => void,
    updateModelAction: () => void,
    updateDateAction: () => void,
    edit: () => void,
    henkiloUpdate: Henkilo,
    henkilo: HenkiloState,
    koodisto: any,
    L: L,
    locale: Locale,
    aktivoiHenkilo: (oid: string) => void,
    yksiloiHenkilo: () => void,
    isAdmin: boolean,
    oidHenkilo: string,
    isValidForm: boolean,
    omattiedot: OmattiedotState
}

type State = {

}

class AdminUserContent extends React.Component<Props, State> {
    render() {
        return this.props.henkilo.henkiloLoading
        || this.props.koodisto.kieliKoodistoLoading
        || this.props.koodisto.kansalaisuusKoodistoLoading
        || this.props.koodisto.sukupuoliKoodistoLoading
        || this.props.henkilo.kayttajatietoLoading
        || this.props.koodisto.yhteystietotyypitKoodistoLoading
            ? <Loader />
            : <AbstractUserContent
                readOnly={this.props.readOnly}
                discardAction={this.props.discardAction}
                updateAction={this.props.updateAction}
                basicInfo={this.createBasicInfo()}
                readOnlyButtons={this.createReadOnlyButtons()}
                isValidForm={this.props.isValidForm}
            />;
    }

    createBasicInfo = () => {
        const props = {
            readOnly: this.props.readOnly,
            updateModelFieldAction: this.props.updateModelAction,
            updateDateFieldAction: this.props.updateDateAction,
            henkiloUpdate: this.props.henkiloUpdate,
        };

        // Basic info box content
        return [
            [
                <Sukunimi {...props} autofocus={true} />,
                <Etunimet {...props} />,
                <Syntymaaika {...props} />,
                <Hetu {...props} />,
                <Kutsumanimi {...props} />,
            ],
            [
                <Kansalaisuus {...props} />,
                <Aidinkieli {...props} />,
                <Oppijanumero {...props} />,
                <Asiointikieli {...props} />,
            ],
            [
                <Kayttajanimi {...props}
                              disabled={!this.props.isAdmin}
                />,
                <LinkitetytHenkilot />,
                <MasterHenkilo oidHenkilo={this.props.oidHenkilo} />
            ],
        ];
    };

    // Basic info default buttons
    createReadOnlyButtons = () => {
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const passivoitu = this.props.henkilo.henkilo.passivoitu;
        const hasHenkiloReadUpdateRights: boolean = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_HENKILON_RU', 'OPPIJANUMEROREKISTERI_REKISTERINPITAJA']);

        const editButton = hasHenkiloReadUpdateRights ? <EditButton editAction={this.props.edit} disabled={duplicate || passivoitu}/> : null;
        const yksiloiHetutonButton = <YksiloiHetutonButton disabled={duplicate || passivoitu} />;
        const puraHetuttomanYksilointiButton = <PuraHetuttomanYksilointiButton disabled={duplicate || passivoitu} />;
        const passivoiButton = !passivoitu && hasHenkiloReadUpdateRights ? <PassivoiButton disabled={duplicate || passivoitu} /> : null;
        const aktivoiButton = passivoitu && hasHenkiloReadUpdateRights ? <AktivoiButton L={this.props.L} oid={this.props.henkilo.henkilo.oidHenkilo} onClick={this.props.aktivoiHenkilo} /> : null;
        const hakaButton = <HakaButton oidHenkilo={this.props.oidHenkilo} styles={{left: '0px', top: '3rem', width: '15rem', padding: '30px'}} disabled={duplicate || passivoitu} />;
        const vtjOverrideButton = <VtjOverrideButton disabled={duplicate || passivoitu} />;
        const passwordButton = <PasswordButton oidHenkilo={this.props.oidHenkilo} styles={{top: '3rem', left: '0', width: '18rem'}} disabled={duplicate || passivoitu} />;

        return [
            editButton,
            yksiloiHetutonButton,
            puraHetuttomanYksilointiButton,
            passivoiButton,
            aktivoiButton,
            hakaButton,
            vtjOverrideButton,
            passwordButton
        ];
    };

}

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    isAdmin: state.omattiedot.isAdmin,
    omattiedot: state.omattiedot
});

export default connect(mapStateToProps, {yksiloiHenkilo, fetchHenkiloSlaves})(AdminUserContent);

