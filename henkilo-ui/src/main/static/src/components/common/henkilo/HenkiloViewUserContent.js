// @flow
import './HenkiloViewUserContent.css'
import React from 'react'
import Columns from 'react-columns'
import StaticUtils from "../StaticUtils";
import EditButtons from "./buttons/EditButtons";
import moment from 'moment';
import type {L} from "../../../types/localisation.type";
import PropertySingleton from "../../../globals/PropertySingleton";

type Props = {
    l10n: any,
    locale: string,
    henkilo: any,
    readOnly: boolean,
    basicInfo: (boolean, (any) => void, (any) => void, any) => any,
    readOnlyButtons: ((any) => void) => any,
    updateHenkiloAndRefetch: (any) => void,
    updateAndRefetchKayttajatieto: (henkiloOid: string, kayttajatunnus: string) => void,
}

type State = {
    henkiloUpdate: any,
    readOnly: boolean,
    showPassive: boolean,
}

class HenkiloViewUserContent extends React.Component<Props, State> {

    L: L;

    constructor(props: Props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: this.props.readOnly,
            showPassive: false,
        };
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper user-content">
                    <div>
                        <div className="header">
                            <p className="oph-h2 oph-bold">{this.L['HENKILO_PERUSTIEDOT_OTSIKKO'] + this._additionalInfo()}</p>
                        </div>
                        <Columns columns={3} gap="10px">
                            {
                                this.props.basicInfo(this.state.readOnly, this._updateModelField.bind(this),
                                    this._updateDateField.bind(this), this.state.henkiloUpdate).map((info, idx) =>
                                    <div key={idx} className="henkiloViewContent">
                                        {
                                            info.map((values, idx2) => <div key={idx2}>{values}</div>
                                        )}
                                    </div>
                                )
                            }
                        </Columns>
                    </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        {this.props.readOnlyButtons(this._edit.bind(this)).map((button, idx) => <div style={{display: 'inline-block'}} key={idx}>{button}</div>)}
                    </div>
                    : <div className="henkiloViewEditButtons">
                        <EditButtons discardAction={this._discard.bind(this)}
                                     updateAction={this._update.bind(this)}
                                     L={this.L} />
                    </div>
                }
            </div>
        )
    };

    _edit() {
        this.setState({readOnly: false});
    };

    _additionalInfo() {
        const info = [];
        if(this.props.henkilo.henkilo.yksiloity) {
            info.push(this.L['HENKILO_ADDITIONALINFO_YKSILOITY']);
        }
        if(this.props.henkilo.henkilo.yksiloityVTJ) {
            info.push(this.L['HENKILO_ADDITIONALINFO_YKSILOITYVTJ']);
        }
        if(!this.props.henkilo.henkilo.yksiloity && !this.props.henkilo.henkilo.yksiloityVTJ) {
            info.push(this.L['HENKILO_ADDITIOINALINFO_EIYKSILOITY']);
        }
        if(this.props.henkilo.henkilo.duplicate) {
            info.push(this.L['HENKILO_ADDITIONALINFO_DUPLIKAATTI']);
        }
        return info.length ? ' (' + StaticUtils.flatArray(info) + ')' : '';
    }

    _discard() {
        this.setState({
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: true,
        });
    };

    _update() {
        const henkiloUpdate = Object.assign({}, this.state.henkiloUpdate);
        henkiloUpdate.syntymaaika = henkiloUpdate.syntymaika && henkiloUpdate.syntymaaika.includes('.') ? moment(StaticUtils.ddmmyyyyToDate(henkiloUpdate.syntymaaika)).format(PropertySingleton.state.PVM_DBFORMAATTI) : henkiloUpdate.syntymaaika;
        this.props.updateHenkiloAndRefetch(henkiloUpdate);
        if (henkiloUpdate.kayttajanimi !== undefined) {
            this.props.updateAndRefetchKayttajatieto(henkiloUpdate.oidHenkilo, henkiloUpdate.kayttajanimi);
        }
        this.setState({readOnly: true});
    };

    _updateModelField(event: any) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event),
        });
    };

    _updateDateField(event: any) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event)
        });
    };

}

export default HenkiloViewUserContent;
