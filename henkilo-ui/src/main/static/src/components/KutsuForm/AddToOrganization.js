import React from 'react'
import R from 'ramda'

// import {addEmptyOrganization, changeOrganization} from '../../logic/organisations'

// import AddedOrganizations from './AddedOrganizations';

export default class AddToOrganisation extends React.Component {

    render() {
        const L = this.props.l10n;
        return (
            <fieldset className="add-to-organisation">
                <h2>{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO']}</h2>
                {/*<AddedOrganizations changeOrganization={oldId => e => this.changeOrganization(oldId, e)}*/}
                                    {/*orgs={this.props.orgs}*/}
                                    {/*addedOrgs={this.props.addedOrgs}*/}
                                    {/*l10n={this.props.l10n}*/}
                                    {/*uiLang={this.props.uiLang} />*/}
                <div className="row">
                    <a href="#" onClick={this.addEmptyOrganization}>{L['VIRKAILIJAN_KUTSU_LISAA_ORGANISAATIO_LINKKI']}</a>
                </div>
            </fieldset>
        )
    }

    addEmptyOrganization(e) {
        e.preventDefault();
        // addEmptyOrganization();
    }

    changeOrganization(oldOid, e) {
        const selectedOrganization = R.find(R.pathEq(['oid'], e.target.value))(this.props.orgs);
        //console.info('changeOrganization', e.target.value, selectedOrganization);
        if (selectedOrganization) {
            // changeOrganization(oldOid, selectedOrganization, this.props.omaOid);
        }
    }
}

