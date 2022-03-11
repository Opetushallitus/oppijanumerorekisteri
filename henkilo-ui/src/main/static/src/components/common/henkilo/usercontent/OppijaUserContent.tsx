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
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { Locale } from '../../../../types/locale.type';
import { yksiloiHenkilo } from '../../../../actions/henkilo.actions';
import Loader from '../../icons/Loader';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import Sukupuoli from '../labelvalues/Sukupuoli';

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
    koodisto: any;
    L: Localisations;
    locale: Locale;
    omattiedot: OmattiedotState;
};

type DispatchProps = {
    yksiloiHenkilo: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class OppijaUserContent extends React.Component<Props> {
    render() {
        return this.props.henkilo.henkiloLoading ||
            this.props.koodisto.kieliKoodistoLoading ||
            this.props.koodisto.sukupuoliKoodistoLoading ||
            this.props.koodisto.kansalaisuusKoodistoLoading ||
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
        const basicInfoProps = {
            readOnly: this.props.readOnly,
            updateModelFieldAction: this.props.updateModelAction,
            updateDateFieldAction: this.props.updateDateAction,
            henkiloUpdate: this.props.henkiloUpdate,
        };

        // Basic info box content
        return [
            [
                <Sukunimi autofocus {...basicInfoProps} />,
                <Etunimet {...basicInfoProps} />,
                <Syntymaaika {...basicInfoProps} />,
                <Hetu {...basicInfoProps} />,
                <Kutsumanimi {...basicInfoProps} />,
            ],
            [
                <Kansalaisuus {...basicInfoProps} />,
                <Aidinkieli {...basicInfoProps} />,
                <Sukupuoli {...basicInfoProps} />,
                <Oppijanumero {...basicInfoProps} />,
                <Oid {...basicInfoProps} />,
                <Asiointikieli {...basicInfoProps} />,
            ],
            [<LinkitetytHenkilot oppija={true} />, <MasterHenkilo oidHenkilo={this.props.oidHenkilo} oppija={true} />],
        ];
    };

    // Basic info default buttons
    createReadOnlyButtons = () => {
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const passivoitu = this.props.henkilo.henkilo.passivoitu;

        const hasHenkiloReadUpdateRights = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
        const hasYksilointiRights = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);

        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={this.props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const yksiloiHetutonButton = hasYksilointiRights ? (
            <YksiloiHetutonButton disabled={duplicate || passivoitu} />
        ) : null;

        return [editButton, yksiloiHetutonButton];
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    yksiloiHenkilo,
})(OppijaUserContent);
