import React from 'react'
import R from 'ramda'
import locale from '../../configuration/locale';
// import {addEmptyOrganization, changeOrganization} from '../../logic/organisations'
import { AddedOrganizations } from './AddedOrganizations';

export default class KutsuOrganisaatios extends React.Component {

    render() {
        const L = this.props.l10n[locale];
        return (
            <fieldset className="add-to-organisation">
                <h2>{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO']}</h2>
                <AddedOrganizations orgs={this.props.orgs}
                                    addedOrgs={this.props.addedOrgs}
                                    l10n={this.props.l10n} />
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

    changeOrganization(oldOid, e) {
        const selectedOrganization = R.find(R.pathEq(['oid'], e.target.value))(this.props.orgs);
        //console.info('changeOrganization', e.target.value, selectedOrganization);
        if (selectedOrganization) {
            // changeOrganization(oldOid, selectedOrganization, this.props.omaOid);
        }
    }

}

KutsuOrganisaatios.propTypes = {
    addedOrgs: React.PropTypes.array,
    l10n: React.PropTypes.object,
    omattiedot: React.PropTypes.object,
    orgs: React.PropTypes.array,
    henkilo: React.PropTypes.object,
    addOrganisaatio: React.PropTypes.func
};

