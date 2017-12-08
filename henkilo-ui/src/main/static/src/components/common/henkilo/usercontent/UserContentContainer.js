// @flow
import './UserContentContainer.css';
import React from 'react';
import {connect} from 'react-redux';
import StaticUtils from "../../StaticUtils";
import moment from 'moment';
import type {L} from "../../../../types/localisation.type";
import PropertySingleton from "../../../../globals/PropertySingleton";
import {updateHenkiloAndRefetch, updateAndRefetchKayttajatieto} from "../../../../actions/henkilo.actions";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import EditButton from "../buttons/EditButton";
import PassivoiButton from "../buttons/PassivoiButton";
import PasswordButton from "../buttons/PasswordButton";
import Sukunimi from "../labelvalues/Sukunimi";
import Kayttajanimi from "../labelvalues/Kayttajanimi";
import * as R from 'ramda';
import AbstractUserContent from "./AbstractUserContent";
import OppijaUserContent from "./OppijaUserContent";
import AdminUserContent from "./AdminUserContent";
import VirkailijaUserContent from "./VirkailijaUserContent";

type Props = {
    L: L,
    henkilo: {
        henkilo: Henkilo,
        henkiloLoading: boolean,
        kayttajatietoLoading: boolean,
    },
    koodisto: {
        kieliKoodistoLoading: boolean,
        kansalaisuusKoodistoLoading: boolean,
        sukupuoliKoodistoLoading: boolean,
        yhteystietotyypitKoodistoLoading: boolean,
    },
    readOnly: boolean,
    basicInfo: (boolean, (any) => void, (any) => void, any) => any,
    readOnlyButtons: ((any) => void) => any,
    updateHenkiloAndRefetch: (any) => void,
    updateAndRefetchKayttajatieto: (henkiloOid: string, kayttajatunnus: string) => void,
    oidHenkilo: string,
    view: string,
}

type State = {
    henkiloUpdate: any,
    readOnly: boolean,
    showPassive: boolean,
    isLoading: boolean,
}

class UserContentContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            henkiloUpdate: {},
            readOnly: true,
            showPassive: false,
            isLoading: true,
        };
    };

    componentWillReceiveProps(nextProps: Props) {
        if (this.state.isLoading) {
            const allLoaded = !nextProps.henkilo.henkiloLoading;
            if (allLoaded) {
                this.setState({
                    isLoading: false,
                    henkiloUpdate: JSON.parse(JSON.stringify(nextProps.henkilo.henkilo)), // deep copy
                });
            }
        }
    }

    render() {
        let content;
        if (this.props.view === 'OPPIJA') {
            content = <OppijaUserContent
                readOnly={this.state.readOnly}
                discardAction={this._discard.bind(this)}
                updateAction={this._update.bind(this)}
                updateModelAction={this._updateModelField.bind(this)}
                updateDateAction={this._updateDateField.bind(this)}
                henkiloUpdate={this.state.henkiloUpdate}
                edit={this._edit.bind(this)}
            />;
        }
        else if (this.props.view === 'ADMIN') {
            content = <AdminUserContent
                readOnly={this.state.readOnly}
                discardAction={this._discard.bind(this)}
                updateAction={this._update.bind(this)}
                updateModelAction={this._updateModelField.bind(this)}
                updateDateAction={this._updateDateField.bind(this)}
                henkiloUpdate={this.state.henkiloUpdate}
                edit={this._edit.bind(this)}
                oidHenkilo={this.props.oidHenkilo}
            />;
        }
        else if (this.props.view === 'VIRKAILIJA') {
            content = <VirkailijaUserContent
                readOnly={this.state.readOnly}
                discardAction={this._discard.bind(this)}
                updateAction={this._update.bind(this)}
                updateModelAction={this._updateModelField.bind(this)}
                updateDateAction={this._updateDateField.bind(this)}
                henkiloUpdate={this.state.henkiloUpdate}
                edit={this._edit.bind(this)}
                oidHenkilo={this.props.oidHenkilo}
            />
        }
        else {
            content = <AbstractUserContent
                basicInfo={this.createBasicInfo()}
                readOnlyButtons={this.createReadOnlyButtons()}
                readOnly={this.state.readOnly}
                discardAction={this._discard.bind(this)}
                updateAction={this._update.bind(this)}
            />;
        }
        return <div className="henkiloViewUserContentWrapper">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.props.L['HENKILO_PERUSTIEDOT_OTSIKKO'] + this._additionalInfo()}</p>
                    </div>
                    { content }
                </div>;
    }

    createBasicInfo() {
        return this.props.henkilo.henkilo.henkiloTyyppi === 'PALVELU'
            ? [
                [
                    <Sukunimi autofocus={true}
                              label="HENKILO_PALVELUN_NIMI"
                              readOnly={this.state.readOnly}
                              updateModelFieldAction={this._updateModelField.bind(this)} />,
                ],
                [
                    <Kayttajanimi disabled={!!R.path(['kayttajatieto', 'username'], this.props.henkilo)}
                                  readOnly={this.state.readOnly}
                                  updateModelFieldAction={this._updateModelField.bind(this)} />,
                ],
            ]
            : this.props.basicInfo(this.state.readOnly,
                this._updateModelField.bind(this),
                this._updateDateField.bind(this),
                this.state.henkiloUpdate);
    }

    createReadOnlyButtons() {
        return this.props.henkilo.henkilo.henkiloTyyppi === 'PALVELU'
            ? [
                <EditButton editAction={this._edit.bind(this)} />,
                <PassivoiButton />,
                <PasswordButton oidHenkilo={this.props.oidHenkilo}
                                styles={{top: '3rem', left: '0', width: '18rem'}}/>,
            ]
            : this.props.readOnlyButtons(this._edit.bind(this));
    }

    _edit() {
        this.setState({readOnly: false});
    }

    _additionalInfo() {
        const info = [];
        if (this.props.henkilo.henkilo.yksiloity) {
            info.push(this.props.L['HENKILO_ADDITIONALINFO_YKSILOITY']);
        }
        if (this.props.henkilo.henkilo.yksiloityVTJ) {
            info.push(this.props.L['HENKILO_ADDITIONALINFO_YKSILOITYVTJ']);
        }
        if (!this.props.henkilo.henkilo.yksiloity && !this.props.henkilo.henkilo.yksiloityVTJ) {
            info.push(this.props.L['HENKILO_ADDITIOINALINFO_EIYKSILOITY']);
        }
        if (this.props.henkilo.henkilo.duplicate) {
            info.push(this.props.L['HENKILO_ADDITIONALINFO_DUPLIKAATTI']);
        }
        return info.length ? ' (' + StaticUtils.flatArray(info) + ')' : '';
    }

    _discard() {
        this.setState({
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: true,
        });
    }

    _update() {
        const henkiloUpdate = Object.assign({}, this.state.henkiloUpdate);
        henkiloUpdate.syntymaaika = henkiloUpdate.syntymaika && henkiloUpdate.syntymaaika.includes('.') ? moment(StaticUtils.ddmmyyyyToDate(henkiloUpdate.syntymaaika)).format(PropertySingleton.state.PVM_DBFORMAATTI) : henkiloUpdate.syntymaaika;
        this.props.updateHenkiloAndRefetch(henkiloUpdate);
        if (henkiloUpdate.kayttajanimi !== undefined) {
            this.props.updateAndRefetchKayttajatieto(henkiloUpdate.oidHenkilo, henkiloUpdate.kayttajanimi);
        }
        this.setState({readOnly: true});
    }

    _updateModelField(event: any) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event),
        });
    }

    _updateDateField(event: any) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event)
        });
    }

}

const mapStateToProps = (state) => ({
    koodisto: state.koodisto,
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {updateHenkiloAndRefetch, updateAndRefetchKayttajatieto})(UserContentContainer);
