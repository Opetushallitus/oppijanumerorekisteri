import React from 'react';

import AddedOrganization from './AddedOrganization';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';

type Props = {
    addedOrgs: readonly KutsuOrganisaatio[];
};

export const AddedOrganizations = (props: Props) => (
    <div>
        {props.addedOrgs.map((organization, index) => (
            <AddedOrganization key={organization.key} index={index} addedOrg={organization} />
        ))}
    </div>
);
