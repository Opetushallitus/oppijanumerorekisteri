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
import {yksiloiHenkilo} from "../../../../actions/henkilo.actions";
import Loader from "../../icons/Loader";

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
}

type State = {
    isLoading: boolean,
}

class OppijaUserContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.state.isLoading) {
            const allLoaded = !nextProps.henkilo.henkiloLoading
                && !nextProps.koodisto.kieliKoodistoLoading
                && !nextProps.koodisto.kansalaisuusKoodistoLoading
                // && !nextProps.koodisto.sukupuoliKoodistoLoading
                // && !nextProps.henkilo.kayttajatietoLoading
                && !nextProps.koodisto.yhteystietotyypitKoodistoLoading;
            if (allLoaded) {
                this.setState({
                    isLoading: false,
                });
            }
        }
    }

    render() {
        // Basic info box content
        const _createBasicInfo = (readOnly, updateModelAction, updateDateAction, henkiloUpdate: Henkilo) => {
            const props = {
                readOnly: readOnly,
                updateModelFieldAction: updateModelAction,
                updateDateFieldAction: updateDateAction,
            };
            return [
                [
                    <Sukunimi autofocus
                              {...props}/>,
                    <Etunimet {...props}/>,
                    <Syntymaaika henkiloUpdate={henkiloUpdate}
                                 {...props}/>,
                    <Hetu {...props} />,
                    <Kutsumanimi {...props} />,
                ],
                [
                    <Kansalaisuus {...props}
                                  henkiloUpdate={henkiloUpdate} />,
                    <Aidinkieli {...props}
                                henkiloUpdate={henkiloUpdate} />,
                    <Oppijanumero {...props} />,
                    <Asiointikieli {...props}
                                   henkiloUpdate={henkiloUpdate} />,
                ],
                [

                ],
            ];
        };

        // Basic info default buttons
        const _readOnlyButtons = (edit) => {
            const duplicate = this.props.henkilo.henkilo.duplicate;
            const passivoitu = this.props.henkilo.henkilo.passivoitu;
            return [
                <EditButton
                    editAction={edit}
                    disabled={duplicate || passivoitu}
                />,
                <YksiloiHetutonButton
                    disabled={duplicate || passivoitu}
                    yksiloiAction={yksiloiHenkilo}
                />,
                <PassivoiButton disabled={duplicate || passivoitu} />,
            ];
        };

        return this.state.isLoading
            ? <Loader />
            : <AbstractUserContent
                readOnly={this.props.readOnly}
                discardAction={this.props.discardAction}
                updateAction={this.props.updateAction}
                basicInfo={_createBasicInfo(this.props.readOnly, this.props.updateModelAction, this.props.updateDateAction, this.props.henkiloUpdate)}
                readOnlyButtons={_readOnlyButtons(this.props.edit)}
            />;
    }
}

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
});

export default connect(mapStateToProps, {yksiloiHenkilo})(OppijaUserContent);

