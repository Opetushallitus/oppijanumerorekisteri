import React from 'react';
import { connect } from 'react-redux';
import { hasAnyPalveluRooli } from '../utilities/palvelurooli.util';
import type { RootState } from '../store';
import type { KayttooikeusOrganisaatiot } from '../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';

type OwnProps = {
    roles: string[];
};

type StateProps = {
    isRekisterinpitaja: boolean;
    organisaatiot: Array<KayttooikeusOrganisaatiot>;
};

type Props = OwnProps & StateProps;

const AccessRightCheck: React.FC<Props> = ({ roles, isRekisterinpitaja, organisaatiot, children }) =>
    isRekisterinpitaja || hasAnyPalveluRooli(organisaatiot, roles) ? <>{children}</> : null;

const mapStateToProps = (state: RootState): StateProps => ({
    isRekisterinpitaja: state.omattiedot.isAdmin,
    organisaatiot: state.omattiedot.organisaatiot,
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(AccessRightCheck);
