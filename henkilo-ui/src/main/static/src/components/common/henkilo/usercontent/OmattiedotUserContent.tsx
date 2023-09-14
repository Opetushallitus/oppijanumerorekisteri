import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import Etunimet from '../labelvalues/Etunimet';
import Kutsumanimi from '../labelvalues/Kutsumanimi';
import Oid from '../labelvalues/Oid';
import Oppijanumero from '../labelvalues/Oppijanumero';
import Asiointikieli from '../labelvalues/Asiointikieli';
import EditButton from '../buttons/EditButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { fetchHenkiloSlaves, yksiloiHenkilo } from '../../../../actions/henkilo.actions';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import PasswordButton from '../buttons/PasswordButton';
import Syntymaaika from '../labelvalues/Syntymaaika';
import Hetu from '../labelvalues/Hetu';
import Kansalaisuus from '../labelvalues/Kansalaisuus';
import Aidinkieli from '../labelvalues/Aidinkieli';
import Sukupuoli from '../labelvalues/Sukupuoli';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import AnomusIlmoitus from '../labelvalues/AnomusIlmoitus';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import HenkiloVarmentajaSuhde from '../labelvalues/HenkiloVarmentajaSuhde';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
    updateModelAction: () => void;
    updateDateAction: () => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    oidHenkilo: string;
    isValidForm: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    L: Localisations;
    isAdmin: boolean;
    omattiedot: OmattiedotState;
};

type DispatchProps = {
    yksiloiHenkilo: (oid: string) => void;
    fetchHenkiloSlaves: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class OmattiedotUserContent extends React.Component<Props> {
    render() {
        return this.props.henkilo.henkiloLoading ||
            this.props.henkilo.kayttajatietoLoading ||
            this.props.koodisto.sukupuoliKoodistoLoading ||
            this.props.koodisto.kieliKoodistoLoading ||
            this.props.koodisto.kansalaisuusKoodistoLoading ||
            this.props.omattiedot.omattiedotLoading ? (
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
            henkilo: this.props.henkilo,
            omattiedot: this.props.omattiedot,
        };

        const showAnomusIlmoitus = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'KAYTTOOIKEUS_REKISTERINPITAJA',
        ]);

        // Basic info box content
        return [
            [
                <Etunimet key="omattiedot-etunimet" {...props} />,
                <Sukunimi key="omattiedot-sukunimi" {...props} />,
                <Syntymaaika key="omattiedot-syntymaaika" {...props} />,
                <Hetu key="omattiedot-hetu" {...props} />,
                <Kutsumanimi key="omattiedot-kutsumanimi" {...props} />,
            ],
            [
                <Kansalaisuus key="omattiedot-kansalaisuus" {...props} />,
                <Aidinkieli key="omattiedot-aidinkieli" {...props} />,
                <Sukupuoli key="omattiedot-sukupuoli" {...props} />,
                <Oppijanumero key="omattiedot-oppijanumero" {...props} />,
                <Oid key="omattiedot-oid" {...props} />,
                <Asiointikieli key="omattiedot-asiointikieli" {...props} />,
            ],
            [
                <Kayttajanimi key="omattiedot-kayttajanimi" {...props} disabled={true} />,
                showAnomusIlmoitus ? <AnomusIlmoitus key="omattiedot-anomusilmoitus" {...props} /> : null,
                <HenkiloVarmentajaSuhde
                    key="omattiedot-henkiloVarmentajas"
                    oidHenkilo={this.props.omattiedot.data.oid}
                    type="henkiloVarmentajas"
                />,
                <HenkiloVarmentajaSuhde
                    key="omattiedot-henkiloVarmennettavas"
                    oidHenkilo={this.props.omattiedot.data.oid}
                    type="henkiloVarmennettavas"
                />,
            ],
        ];
    };

    // Basic info default buttons
    createReadOnlyButtons = () => {
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const passivoitu = this.props.henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !this.props.henkilo.kayttajatieto?.username;
        return [
            <EditButton key="editbutton" editAction={this.props.edit} disabled={duplicate || passivoitu} />,
            <PasswordButton
                key="passwordbutton"
                oidHenkilo={this.props.omattiedot.data.oid}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />,
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
})(OmattiedotUserContent);
