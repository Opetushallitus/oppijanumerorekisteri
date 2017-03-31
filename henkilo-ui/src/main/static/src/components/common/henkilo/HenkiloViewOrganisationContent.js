import './HenkiloViewOrganisationContent.css'
import React from 'react'
import Columns from 'react-columns'
import Button from "../button/Button";

const HenkiloViewOrganisationContent = React.createClass({
    propTypes: {
        henkilo: React.PropTypes.shape({henkiloOrgs: React.PropTypes.Array}.isRequired),
        l10n: React.PropTypes.object.isRequired,
        readOnly: React.PropTypes.bool.isRequired,
        showPassive: React.PropTypes.bool,
        locale: React.PropTypes.string.isRequired,
    },
    getInitialState: function() {
        const organisations = this.props.henkilo.henkiloOrgs;

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
        const L = this.props.l10n[this.props.locale];
        return (
            <div className="henkiloViewUserContentWrapper">
                <Columns columns={1}>
                    <div>
                        <div className="header">
                            <h2>{L['HENKILO_ORGANISAATIOT_OTSIKKO']}</h2>
                        </div>
                        <label className="oph-checkable" htmlFor="showPassive">
                            <input id="showPassive" type="checkbox" className="oph-checkable-input" onChange={() => this.setState({showPassive: !this.state.showPassive})} />
                            <span className="oph-checkable-text"> {L['HENKILO_NAYTA_PASSIIVISET_TEKSTI']}</span>
                        </label>
                        <div className="henkiloViewContent">
                            {this.state.organisationInfo.map((values, idx) =>
                                !values.passive || this.state.showPassive
                                    ? <div key={idx}>
                                        <div><span className="oph-bold">{values.name} ({values.typesFlat})</span></div>
                                        <div>
                                            <span className="oph-bold">{L['HENKILO_ORGTUNNISTE']}:</span>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <span>{values.id}</span>
                                        </div>
                                        <div>
                                            <span className="oph-bold">{L['HENKILO_TEHTAVANIMIKE']}:</span>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <span>{values.role}</span>
                                        </div>
                                        <div>
                                            {!values.passive
                                                ? <Button action={() => {}}>{L['HENKILO_PASSIVOI']}</Button>
                                                : <Button action={() => {}} disabled={true}>{L['HENKILO_PASSIVOITU']}</Button>}
                                        </div>
                                    </div>
                                    : null
                            )}
                        </div>
                    </div>
                </Columns>
            </div>
        )
    },
});

export default HenkiloViewOrganisationContent
