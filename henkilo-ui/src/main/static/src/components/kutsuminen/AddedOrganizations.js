// @flow
import React from 'react'
import PropTypes from 'prop-types'

import AddedOrganization from './AddedOrganization';
import type {KutsuOrganisaatio} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";

type Props = {
    addedOrgs: Array<KutsuOrganisaatio>,
}

export const AddedOrganizations = (props: Props) =>
    <div>{props.addedOrgs.map((organization, index) =>
        <AddedOrganization
            key={index}
            index={index}
            addedOrgs={props.addedOrgs}
            addedOrg={organization}
        />)}
    </div>;


AddedOrganizations.propTypes = {
    key: PropTypes.string,
    orgs: PropTypes.array,
    addedOrgs: PropTypes.array,
    addedOrg: PropTypes.object,
    changeOrganization: PropTypes.func,
};
