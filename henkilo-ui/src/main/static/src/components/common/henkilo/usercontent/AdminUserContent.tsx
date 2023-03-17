import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
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
import { fetchHenkiloSlaves, yksiloiHenkilo } from '../../../../actions/henkilo.actions';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import PuraHetuttomanYksilointiButton from '../buttons/PuraHetuttomanYksilointi';
import HakaButton from '../buttons/HakaButton';
import VtjOverrideButton from '../buttons/VtjOverrideButton';
import PasswordButton from '../buttons/PasswordButton';
import AktivoiButton from '../buttons/AktivoiButton';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import Sukupuoli from '../labelvalues/Sukupuoli';
import SahkopostitunnisteButton from '../buttons/SahkopostitunnisteButton';
import PassinumeroButton from '../buttons/PassinumeroButton';
import PoistaKayttajatunnusButton from '../buttons/PoistaKayttajatunnusButton';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
    updateModelAction: () => void;
    updateDateAction: () => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    aktivoiHenkilo: (oid: string) => void;
    oidHenkilo: string;
    isValidForm: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: any;
    L: Localisations;
    isAdmin: boolean;
    omattiedot: OmattiedotState;
};

type DispatchProps = {
    yksiloiHenkilo: (oid: string) => void;
    fetchHenkiloSlaves: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class AdminUserContent extends React.Component<Props> {
    render() {
        return this.props.henkilo.henkiloLoading ||
            this.props.koodisto.kieliKoodistoLoading ||
            this.props.koodisto.kansalaisuusKoodistoLoading ||
            this.props.koodisto.sukupuoliKoodistoLoading ||
            this.props.henkilo.kayttajatietoLoading ||
            this.props.koodisto.yhteystietotyypitKoodistoLoading ? (
            <Loader />
        ) : (
            <AbstractUserContent
                readOnly={this.props.readOnly}
                discardAction={this.props.discardAction}
                updateAction={this.props.updateAction}
                basicInfo={this.createBasicInfo()}
                readOnlyButtons={this.createReadOnlyButtons()}
                isValidForm={this.props.isValidForm}
            />
        );
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
                <Sukupuoli {...props} />,
                <Oppijanumero {...props} />,
                <Oid {...props} />,
                <Asiointikieli {...props} />,
            ],
            [
                <Kayttajanimi
                    {...props}
                    disabled={!this.props.isAdmin || !this.props.henkilo.kayttajatieto?.username}
                />,
                <LinkitetytHenkilot />,
                <MasterHenkilo oidHenkilo={this.props.oidHenkilo} />,
            ],
        ];
    };

    // Basic info default buttons
    createReadOnlyButtons = () => {
        const buttonPopupStyles = {
            left: '0px',
            top: '3rem',
            width: '15rem',
            padding: '30px',
        };
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const passivoitu = this.props.henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !this.props.henkilo.kayttajatieto?.username;
        const hasHenkiloReadUpdateRights: boolean = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
        const isOnrRekisterinpitaja: boolean = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'HENKILONHALLINTA_OPHREKISTERI',
        ]);
        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={this.props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const yksiloiHetutonButton = <YksiloiHetutonButton disabled={duplicate || passivoitu} />;
        const puraHetuttomanYksilointiButton = <PuraHetuttomanYksilointiButton disabled={duplicate || passivoitu} />;
        const passivoiButton =
            !passivoitu && hasHenkiloReadUpdateRights ? <PassivoiButton disabled={duplicate || passivoitu} /> : null;
        const poistaKayttajatunnusBtn =
            isOnrRekisterinpitaja && !kayttajatunnukseton ? <PoistaKayttajatunnusButton /> : null;
        const aktivoiButton =
            passivoitu && hasHenkiloReadUpdateRights ? (
                <AktivoiButton
                    L={this.props.L}
                    oid={this.props.henkilo.henkilo.oidHenkilo}
                    onClick={this.props.aktivoiHenkilo}
                />
            ) : null;
        const hakaButton = (
            <HakaButton
                oidHenkilo={this.props.oidHenkilo}
                styles={buttonPopupStyles}
                disabled={duplicate || passivoitu}
            />
        );
        const sahkopostiTunnisteButton = isOnrRekisterinpitaja ? (
            <SahkopostitunnisteButton
                oidHenkilo={this.props.oidHenkilo}
                styles={buttonPopupStyles}
            ></SahkopostitunnisteButton>
        ) : null;
        const passinumeroButton = isOnrRekisterinpitaja ? (
            <PassinumeroButton oid={this.props.oidHenkilo} styles={buttonPopupStyles}></PassinumeroButton>
        ) : null;
        const vtjOverrideButton = <VtjOverrideButton disabled={duplicate || passivoitu} />;
        const passwordButton = (
            <PasswordButton
                oidHenkilo={this.props.oidHenkilo}
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
            sahkopostiTunnisteButton,
            passinumeroButton,
            vtjOverrideButton,
            passwordButton,
        ];
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
    isAdmin: state.omattiedot.isAdmin,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    yksiloiHenkilo,
    fetchHenkiloSlaves,
})(AdminUserContent);
