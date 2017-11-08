// @flow
import './HenkiloViewOrganisationContent.css'
import React from 'react'
import Columns from 'react-columns'
import type {Locale} from '../../../types/locale.type'
import PassivoiOrganisaatioButton from "./buttons/PassivoiOrganisaatioButton";
import StaticUtils from "../StaticUtils";
import type {L} from "../../../types/l.type";

type Props = {
    l10n: any,
    locale: Locale,
    readOnly: boolean,
    henkilo: {
        henkilo: any,
        henkiloOrgs: Array<any>,
    },
    kayttooikeus: any,
    passivoiHenkiloOrg: (henkiloOid: string, organisaatioOid: string) => void,
}

type State = {
    readOnly: boolean,
    showPassive: boolean,
}

type OrganisaatioFlat = {|
    name: string,
    typesFlat: string,
    role: string,
    passive: boolean,
    id: string,
|}

class HenkiloViewOrganisationContent extends React.Component<Props, State> {

    L: L;

    constructor(props: Props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.state = {
            readOnly: this.props.readOnly,
            showPassive: false,
        };
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_ORGANISAATIOT_OTSIKKO']}</p>
                    </div>
                    <label className="oph-checkable" htmlFor="showPassive">
                        <input id="showPassive" type="checkbox" className="oph-checkable-input" onChange={() => this.setState({showPassive: !this.state.showPassive})} />
                        <span className="oph-checkable-text"> {this.L['HENKILO_NAYTA_PASSIIVISET_TEKSTI']}</span>
                    </label>
                    <div className="organisationContentWrapper">
                        <Columns queries={[{columns: 3, query: 'min-width: 200px'}]} gap="10px" >
                            {this.flatOrganisations(this.props.henkilo.henkiloOrgs).map((values, idx) =>
                                !values.passive || this.state.showPassive
                                    ?
                                    <div key={idx}>
                                        <div><span className="oph-bold">{values.name} {values.typesFlat}</span></div>
                                        <div className="labelValue">
                                            <span className="oph-bold">{this.L['HENKILO_ORGTUNNISTE']}:</span>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <span>{values.id}</span>
                                        </div>
                                        <div className="labelValue">
                                            <span className="oph-bold">{this.L['HENKILO_TEHTAVANIMIKE']}:</span>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <span>{values.role}</span>
                                        </div>
                                        <div className="labelValue">
                                            <PassivoiOrganisaatioButton passive={values.passive}
                                                                        id={values.id}
                                                                        L={this.L}
                                                                        passivoiOrgAction={this.passivoiHenkiloOrganisation.bind(this)}
                                                                        disabled={this.hasNoPermission(values.id)} />
                                        </div>
                                    </div>
                                    : null
                            )}
                        </Columns>
                    </div>
                </div>
            </div>
        )
    };

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    hasNoPermission(organisaatioOid: string) {
        return !this.props.kayttooikeus.grantableKayttooikeusLoading
            && !this.props.kayttooikeus.grantableKayttooikeus[organisaatioOid];
    };


    passivoiHenkiloOrganisation(organisationOid: string) {
        this.props.passivoiHenkiloOrg(this.props.henkilo.henkilo.oidHenkilo, organisationOid);
    };

    flatOrganisations(organisations: Array<any>): Array<OrganisaatioFlat> {
        return organisations.map(organisation =>
            ({
                name: organisation.nimi[this.props.locale],
                typesFlat: organisation.tyypit.length ? '(' + StaticUtils.flatArray(organisation.tyypit) + ')' : '',
                role: organisation.tehtavanimike,
                passive: organisation.passivoitu,
                id: organisation.oid,
            }));
    };
}

export default HenkiloViewOrganisationContent
