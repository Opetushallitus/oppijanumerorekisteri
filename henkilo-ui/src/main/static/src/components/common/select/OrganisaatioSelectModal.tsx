import React from 'react';
import { connect } from 'react-redux';
import OrganisaatioSelect from './OrganisaatioSelect';
import SelectModal from '../modal/SelectModal';
import type { Locale } from '../../../types/locale.type';
import type { Localisations } from '../../../types/localisation.type';
import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import type { OrganisaatioNameLookup } from '../../../reducers/organisaatio.reducer';
import type { RootState } from '../../../reducers';

type OwnProps = {
    organisaatiot?: OrganisaatioHenkilo[];
    onSelect: (organisaatio: OrganisaatioSelectObject) => void;
    disabled?: boolean;
};

type StateProps = {
    organisaatiot: OrganisaatioHenkilo[];
    organisationNames: OrganisaatioNameLookup;
    locale: Locale;
    L: Localisations;
    disabled: boolean;
};

const OrganisaatioSelectModal: React.FC<OwnProps & StateProps> = ({
    onSelect,
    disabled,
    organisaatiot,
    organisationNames,
    locale,
    L,
}) => (
    <SelectModal disabled={disabled} loading={disabled} buttonText={L['OMATTIEDOT_VALITSE_ORGANISAATIO']}>
        <OrganisaatioSelect
            locale={locale}
            L={L}
            organisaatiot={organisaatiot}
            organisationNames={organisationNames}
            onSelect={onSelect}
        />
    </SelectModal>
);

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    organisationNames: state.organisaatio.names,
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    organisaatiot: ownProps.organisaatiot ? ownProps.organisaatiot : state.omattiedot.organisaatios,
    disabled:
        ownProps.disabled || !(ownProps.organisaatiot ? ownProps.organisaatiot : state.omattiedot.organisaatios).length,
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(OrganisaatioSelectModal);
