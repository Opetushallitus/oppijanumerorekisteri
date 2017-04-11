import React from 'react'

import AddedOrganization from './AddedOrganization';

export const AddedOrganizations = (props) =>
    <div>{props.addedOrgs.map((organization, index) =>
        <AddedOrganization
            key={index}
            index={index}
            orgs={props.orgs}
            addedOrgs={props.addedOrgs}
            addedOrg={organization}
            l10n={props.l10n} />)}
    </div>;


AddedOrganizations.propTypes = {
    key: React.PropTypes.string,
    orgs: React.PropTypes.array,
    addedOrgs: React.PropTypes.array,
    addedOrg: React.PropTypes.object,
    changeOrganization: React.PropTypes.func,
    l10n: React.PropTypes.object,
};
