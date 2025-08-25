import React, { SyntheticEvent } from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import EditButton from '../buttons/EditButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { fetchKayttajatieto } from '../../../../actions/henkilo.actions';
import Loader from '../../icons/Loader';
import Oid from '../labelvalues/Oid';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import PasswordButton from '../buttons/PasswordButton';
import PassivoiButton from '../buttons/PassivoiButton';
import AktivoiButton from '../buttons/AktivoiButton';
import PoistaKayttajatunnusButton from '../buttons/PoistaKayttajatunnusButton';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
    updateModelAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
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
};

type DispatchProps = {
    fetchKayttajatieto: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class PalveluUserContent extends React.Component<Props> {
    componentDidMount() {
        if (!this.props.henkilo.kayttajatieto?.username && !this.props.henkilo.kayttajatietoLoading) {
            this.props.fetchKayttajatieto(this.props.oidHenkilo);
        }
    }

    render() {
        return this.props.henkilo.henkiloLoading || this.props.henkilo.kayttajatietoLoading ? (
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
            [<Sukunimi key="palveluuser-sukunimi" autofocus={true} label="HENKILO_PALVELUN_NIMI" {...props} />],
            [
                <Oid key="palveluuser-oid" {...props} />,
                <Kayttajanimi
                    key="palveluuser-kayttajanimi"
                    disabled={!this.props.isAdmin && !!this.props.henkilo.kayttajatieto?.username}
                    {...props}
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
            this.props.isAdmin ? <PassivoiButton disabled={duplicate || passivoitu} /> : null,
            this.props.isAdmin && this.props.henkilo.henkilo.passivoitu ? (
                <AktivoiButton L={this.props.L} oidHenkilo={this.props.henkilo.henkilo.oidHenkilo} />
            ) : null,
            !kayttajatunnukseton && this.props.isAdmin ? <PoistaKayttajatunnusButton /> : null,
            <PasswordButton
                key="passwordbutton"
                oidHenkilo={this.props.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />,
        ];
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
    isAdmin: state.omattiedot.isAdmin,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchKayttajatieto,
})(PalveluUserContent);
