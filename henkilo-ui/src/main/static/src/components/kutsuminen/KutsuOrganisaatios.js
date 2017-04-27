import React from 'react';
import { AddedOrganizations } from './AddedOrganizations';

export default class KutsuOrganisaatios extends React.Component {

    static propTypes = {
        addedOrgs: React.PropTypes.array,
        l10n: React.PropTypes.object,
        omattiedot: React.PropTypes.object,
        orgs: React.PropTypes.array,
        henkilo: React.PropTypes.object,
        addOrganisaatio: React.PropTypes.func,
        locale: React.PropTypes.string
    }

    render() {
        const L = this.props.l10n[this.props.locale];



        return (
            <fieldset className="add-to-organisation">
                <h2>{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO']}</h2>
                <AddedOrganizations orgs={this.props.orgs}
                                    addedOrgs={this.props.addedOrgs}
                                    l10n={this.props.l10n}
                                    locale={this.props.locale}/>
                <div className="row">
                    <a href="#" onClick={this.addEmptyOrganization.bind(this)}>{L['VIRKAILIJAN_KUTSU_LISAA_ORGANISAATIO_LINKKI']}</a>
                </div>
            </fieldset>
        )
    }

    addEmptyOrganization(e) {
        e.preventDefault();
        this.props.addOrganisaatio({oid: '',
            organisation: {oid: ''},
            selectablePermissions: [],
            selectedPermissions: []
        });
    }

}

