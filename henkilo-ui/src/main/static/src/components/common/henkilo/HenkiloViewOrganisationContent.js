import './HenkiloViewOrganisationContent.css'
import React from 'react'
import Columns from 'react-columns'
import Button from "../button/Button";
import ConfirmButton from "../button/ConfirmButton";

const HenkiloViewOrganisationContent = React.createClass({
    propTypes: {
        henkilo: React.PropTypes.shape({henkiloOrgs: React.PropTypes.Array}.isRequired),
        l10n: React.PropTypes.object.isRequired,
        readOnly: React.PropTypes.bool.isRequired,
        showPassive: React.PropTypes.bool,
        locale: React.PropTypes.string.isRequired,

        passivoiHenkiloOrg: React.PropTypes.func.isRequired,
    },
    getInitialState: function() {
        const organisations = this.props.henkilo.henkiloOrgs;
        this.L = this.props.l10n[this.props.locale];
        return {
            readOnly: this.props.readOnly,
            showPassive: false,
            organisationInfo: organisations.map(organisation =>
                ({name: organisation.nimi[this.props.locale], typesFlat: organisation.tyypit && organisation.tyypit.reduce((type1, type2) => type1.concat(', ', type2)),
                    role: organisation.tehtavanimike, passive: organisation.passivoitu,
                    id: organisation.oid
                })),
        }
    },
    render: function() {
        
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
                    <div className="henkiloViewContent">
                        <Columns queries={[{columns: 3, query: 'min-width: 200px'}]} gap="10px" >
                            {this.state.organisationInfo.map((values, idx) =>
                                !values.passive || this.state.showPassive
                                    ?
                                    <div key={idx}>
                                        <div><span className="oph-bold">{values.name} ({values.typesFlat})</span></div>
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
                                            {!values.passive
                                                ? <ConfirmButton key="passivoiOrg" cancel
                                                                 action={() => this.passivoiHenkiloOrganisation(values.id)}
                                                                 confirmLabel={this.L['HENKILO_ORG_PASSIVOI_CONFIRM']}
                                                                 normalLabel={this.L['HENKILO_ORG_PASSIVOI']}
                                                                 errorMessage={this.props._createPopupErrorMessage('passivoiOrg')} />
                                                : <Button disabled action={() => {}}>{this.L['HENKILO_ORG_PASSIVOITU']}</Button>}
                                        </div>
                                    </div>
                                    : null
                            )}
                        </Columns>
                    </div>
                </div>
            </div>
        )
    },
    passivoiHenkiloOrganisation: function(organisationOid) {
        this.props.passivoiHenkiloOrg(this.props.henkilo.henkilo.oidHenkilo, organisationOid);
    },
});

export default HenkiloViewOrganisationContent
