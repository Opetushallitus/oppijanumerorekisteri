// @flow
import React from 'react';
import {Link} from 'react-router';
import * as R from 'ramda';
import classNames from 'classnames';
import './DuplikaatitPerson.css';
import DuplikaatitApplicationsPopup from './DuplikaatitApplicationsPopup';
import DuplikaatitPersonOtherApplications from './DuplikaatitPersonOtherApplications';
import type {L} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";

type Props = {
    henkilo: any,
    L: L,
    locale: Locale,
    koodisto: any,
    setSelection: any,
    classNames: any,
    isMaster: any,
    header: any,
    styleClasses?: any,
    yksiloitySelected?: boolean,
    vainLuku?: boolean,
}

type State = {
    checkboxValue: boolean,
}

export default class DuplikaatitPrimaryInformation extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            checkboxValue: this.props.isMaster,
        };
    }

    render() {
        const henkilo = this.props.henkilo;
        const hakemus = R.head(henkilo.hakemukset) || {};
        const muutHakemukset = R.tail(henkilo.hakemukset);
        const styleClasses = classNames(this.props.classNames);
        const L = this.props.L;

        return <div className={styleClasses}>
            <span className="type">{L[this.props.header]}</span>
            <span>{henkilo.hetu}</span>
            <span>{(henkilo.yksiloity || henkilo.yksiloityVTJ) ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}</span>
            <span>{henkilo.kutsumanimi}</span>
            <span>{henkilo.etunimet}</span>
            <span>{henkilo.sukunimi}</span>
            <span>{henkilo.sukupuoli === '2' ? L['HENKILO_YHTEISET_NAINEN'] : L['HENKILO_YHTEISET_MIES']}</span>
            <span>{henkilo.syntymaaika}</span>
            <span><Link className="oph-link" to={`/virkailija/${henkilo.oidHenkilo}`}>{henkilo.oidHenkilo}</Link></span>
            <span>{hakemus.kansalaisuus || ''}</span>
            <span>{hakemus.aidinkieli || ''}</span>
            <span>{hakemus.matkapuhelinnumero || ''}</span>
            <span>{hakemus.sahkoposti || ''}</span>
            <span>{hakemus.lahiosoite || ''}</span>
            <span>{hakemus.postinumero || ''}</span>
            <span>{hakemus.passinumero || ''}</span>
            <span>{hakemus.kansallinenIdTunnus || ''}</span>
            <span>{hakemus.state || ''}</span>
            <span>{hakemus.href ? <a className="oph-link" href={hakemus.href}>{hakemus.oid}</a> : ''}</span>
            <span>{muutHakemukset.length > 0 ? <DuplikaatitApplicationsPopup
                popupContent={<DuplikaatitPersonOtherApplications
                    hakemukset={muutHakemukset}
                    koodisto={this.props.koodisto}
                    locale={this.props.locale}
                    L={this.props.L}
                />}>
                {L['DUPLIKAATIT_MUUTHAKEMUKSET']}
                </DuplikaatitApplicationsPopup> : null}</span>
            {!this.props.vainLuku &&
            <span><input type="checkbox" disabled={this.props.isMaster || (this.props.yksiloitySelected && this.props.henkilo.yksiloity)} checked={this.state.checkboxValue}
                         onChange={this._onCheck.bind(this, henkilo.oidHenkilo)}/></span>
            }
        </div>;
    }

    _onCheck(oid: string) {
        this.setState({
            checkboxValue: !this.state.checkboxValue
        });
        this.props.setSelection(oid);
    }
}
