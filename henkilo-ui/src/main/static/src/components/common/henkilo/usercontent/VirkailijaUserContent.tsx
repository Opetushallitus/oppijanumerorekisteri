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
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import Loader from '../../icons/Loader';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import HakaButton from '../buttons/HakaButton';
import PasswordButton from '../buttons/PasswordButton';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';

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

type Props = OwnProps & StateProps;

class VirkailijaUserContent extends React.Component<Props> {
    render() {
        return this.props.henkilo.henkiloLoading ||
            this.props.koodisto.kieliKoodistoLoading ||
            this.props.koodisto.kansalaisuusKoodistoLoading ||
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
                <Sukunimi key="virkailija-sukunimi" autofocus={true} {...props} />,
                <Etunimet key="virkailija-etunimet" {...props} />,
                <Kutsumanimi key="virkailija-kutsumanimi" {...props} />,
                <Asiointikieli key="virkailija-asiointikieli" {...props} />,
            ],
            [<Oppijanumero key="virkailija-oppijanumero" {...props} />, <Oid key="virkailija-oid" {...props} />],
            [
                <Kayttajanimi key="virkailija-kayttajanimi" {...props} disabled={true} />,
                <LinkitetytHenkilot key="virkailija-linkitetyt" />,
                <MasterHenkilo key="virkailija-master" oidHenkilo={this.props.oidHenkilo} />,
            ],
        ];
    };

    // Basic info default buttons
    createReadOnlyButtons = () => {
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const passivoitu = this.props.henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !this.props.henkilo.kayttajatieto?.username;
        const hasHenkiloReadUpdateRights = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={this.props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const hakaButton = (
            <HakaButton
                oidHenkilo={this.props.oidHenkilo}
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
                oidHenkilo={this.props.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />
        );

        return [editButton, hakaButton, passwordButton];
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
    isAdmin: state.omattiedot.isAdmin,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, undefined, OwnProps, RootState>(mapStateToProps)(VirkailijaUserContent);
