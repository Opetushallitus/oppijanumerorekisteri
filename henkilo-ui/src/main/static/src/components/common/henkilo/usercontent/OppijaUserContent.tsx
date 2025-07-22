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
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { Locale } from '../../../../types/locale.type';
import Loader from '../../icons/Loader';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import LinkitetytHenkilot from '../labelvalues/LinkitetytHenkilot';
import MasterHenkilo from '../labelvalues/MasterHenkilo';
import Sukupuoli from '../labelvalues/Sukupuoli';
import { KoodistoState } from '../../../../reducers/koodisto.reducer';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';

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
    koodisto: KoodistoState;
    L: Localisations;
    locale: Locale;
    omattiedot: OmattiedotState;
};

type Props = OwnProps & StateProps;

class OppijaUserContent extends React.Component<Props> {
    render() {
        return this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading ? (
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
            updateModelSelectAction: this.props.updateModelSelectAction,
            updateDateFieldAction: this.props.updateDateAction,
            henkiloUpdate: this.props.henkiloUpdate,
        };
        const oid = this.props.henkilo?.henkilo?.oidHenkilo;

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
                <LinkitetytHenkilot key={`linkitetyt_${oid}`} oppija={true} />,
                <MasterHenkilo key={`master_${oid}`} oidHenkilo={this.props.oidHenkilo} oppija={true} />,
            ],
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

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(OppijaUserContent);
