import React from 'react'

import {AddedOrganization} from './AddedOrganization';

export const AddedOrganizations = (props) =>
    <div>{this.props.addedOrganizations.map( (organization) =>
        <AddedOrganization
        key={organization.oid}
        orgs={this.props.orgs}
        addedOrgs={this.props.addedOrgs}
        addedOrg={organization}
        changeOrganization={this.props.changeOrganization}
        l10n={this.props.l10n}
        uiLang={this.props.uiLang} />)}
    </div>;

AddedOrganizations.propTypes = {
    key: React.PropTypes.string,
    orgs: React.PropTypes.array
};
