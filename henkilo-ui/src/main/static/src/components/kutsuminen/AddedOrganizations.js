// @flow
import React from 'react'
import PropTypes from 'prop-types'

import AddedOrganization from './AddedOrganization';
import type {KutsuOrganisaatio, OrganisaatioHenkilo} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";

type Props = {
    addedOrgs: Array<KutsuOrganisaatio>,
    l10n: {},
    orgs: Array<OrganisaatioHenkilo>,
}

export const AddedOrganizations = (props: Props) =>
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
    key: PropTypes.string,
    orgs: PropTypes.array,
    addedOrgs: PropTypes.array,
    addedOrg: PropTypes.object,
    changeOrganization: PropTypes.func,
    l10n: PropTypes.object,
};
