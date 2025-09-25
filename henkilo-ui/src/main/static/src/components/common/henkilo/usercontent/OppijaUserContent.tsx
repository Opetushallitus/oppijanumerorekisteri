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
    L: Localisations;
    locale: Locale;
    omattiedot: OmattiedotState;
};

type Props = OwnProps & StateProps;

function OppijaUserContent(props: Props) {
    function createBasicInfo() {
        const basicInfoProps = {
            readOnly: props.readOnly,
            updateModelFieldAction: props.updateModelAction,
            updateModelSelectAction: props.updateModelSelectAction,
            updateDateFieldAction: props.updateDateAction,
            henkiloUpdate: props.henkiloUpdate,
        };
        const oid = props.henkilo?.henkilo?.oidHenkilo;

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
                <MasterHenkilo key={`master_${oid}`} oidHenkilo={props.oidHenkilo} oppija={true} />,
            ],
        ];
    }

    function createReadOnlyButtons() {
        const duplicate = props.henkilo.henkilo.duplicate;
        const passivoitu = props.henkilo.henkilo.passivoitu;

        const hasHenkiloReadUpdateRights = hasAnyPalveluRooli(props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
        const hasYksilointiRights = hasAnyPalveluRooli(props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);

        const editButton = hasHenkiloReadUpdateRights ? (
            <EditButton editAction={props.edit} disabled={duplicate || passivoitu} />
        ) : null;
        const yksiloiHetutonButton = hasYksilointiRights ? (
            <YksiloiHetutonButton disabled={duplicate || passivoitu} />
        ) : null;

        return [editButton, yksiloiHetutonButton];
    }
    return props.henkilo.henkiloLoading ? (
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
    locale: state.locale,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(OppijaUserContent);
