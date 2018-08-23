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
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {L} from "../../../../types/localisation.type";
import type {Locale} from "../../../../types/locale.type";
import {yksiloiHenkilo} from "../../../../actions/henkilo.actions";
import Loader from "../../icons/Loader";
import {hasAnyPalveluRooli} from "../../../../utilities/palvelurooli.util";
import type {OmattiedotState} from "../../../../reducers/omattiedot.reducer";
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import Sukupuoli from "../labelvalues/Sukupuoli";

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
    yksiloiHenkilo: () => void,
    oidHenkilo: string,
    isValidForm: boolean,
    omattiedot: OmattiedotState
}

class OppijaUserContent extends React.Component<Props> {

    render() {
        return this.props.henkilo.henkiloLoading
        || this.props.koodisto.kieliKoodistoLoading
        || this.props.koodisto.kansalaisuusKoodistoLoading
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
        const basicInfoProps = {
            readOnly: this.props.readOnly,
            updateModelFieldAction: this.props.updateModelAction,
            updateDateFieldAction: this.props.updateDateAction,
            henkiloUpdate: this.props.henkiloUpdate,
        };

        // Basic info box content
        return [
            [
                <Sukunimi autofocus
                          {...basicInfoProps}/>,
                <Etunimet {...basicInfoProps}/>,
                <Syntymaaika {...basicInfoProps}/>,
                <Hetu {...basicInfoProps} />,
                <Kutsumanimi {...basicInfoProps} />,
            ],
            [
                <Kansalaisuus {...basicInfoProps} />,
                <Aidinkieli {...basicInfoProps} />,
                <Sukupuoli {...basicInfoProps} />,
                <Oppijanumero {...basicInfoProps} />,
                <Asiointikieli {...basicInfoProps} />,
            ],
            [
                <LinkitetytHenkilot oppija={true} />,
                <MasterHenkilo oidHenkilo={this.props.oidHenkilo} oppija={true} />
            ],
        ];
    };

    // Basic info default buttons
    createReadOnlyButtons = () => {
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const passivoitu = this.props.henkilo.henkilo.passivoitu;

        const hasHenkiloReadUpdateRights = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_HENKILON_RU', 'OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI']);
        const hasYksilointiRights = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI']);

        const editButton = hasHenkiloReadUpdateRights ? <EditButton editAction={this.props.edit} disabled={duplicate || passivoitu}/> : null;
        const yksiloiHetutonButton = hasYksilointiRights ? <YksiloiHetutonButton disabled={duplicate || passivoitu} /> : null;

        return [
            editButton,
            yksiloiHetutonButton
        ];
    };

}

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    omattiedot: state.omattiedot
});

export default connect(mapStateToProps, {yksiloiHenkilo})(OppijaUserContent);

