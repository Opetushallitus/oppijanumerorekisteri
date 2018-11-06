// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { Localisations } from '../../types/localisation.type'
import { fetchOmattiedotOrganisaatios } from '../../actions/omattiedot.actions'
import { setPalvelukayttajatCriteria, fetchPalvelukayttajat } from '../../actions/palvelukayttaja.actions'
import PalvelukayttajaHakuPage from './PalvelukayttajaHakuPage'
import type { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer'
import type { OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types'
import type {Locale} from "../../types/locale.type";

type Props = {
    L: Localisations,
    locale: Locale,
    palvelukayttajat: PalvelukayttajatState,
    omatOrganisaatiot: Array<OrganisaatioHenkilo>,
    fetchOmattiedotOrganisaatios: () => void,
    setPalvelukayttajatCriteria: (criteria: PalvelukayttajaCriteria) => void,
    fetchPalvelukayttajat: (criteria: PalvelukayttajaCriteria) => void,
    omatOrganisaatiosLoading: boolean
}

class PalvelukayttajaHakuContainer extends React.Component<Props> {

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios()
    }

    render() {
        return <PalvelukayttajaHakuPage
            L={this.props.L}
            locale={this.props.locale}
            organisaatiot={this.props.omatOrganisaatiot}
            onCriteriaChange={this.onCriteriaChange}
            palvelukayttajat={this.props.palvelukayttajat}
            organisaatiotLoading={this.props.omatOrganisaatiosLoading}
        />
    }

    onCriteriaChange = (criteria: PalvelukayttajaCriteria) => {
        this.props.setPalvelukayttajatCriteria(criteria);
        if (criteria.nameQuery || criteria.organisaatioOids) {
            this.props.fetchPalvelukayttajat(criteria)
        }
    }

}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    palvelukayttajat: state.palvelukayttajat,
    omatOrganisaatiot: state.omattiedot.organisaatios,
    omatOrganisaatiosLoading: state.omattiedot.omattiedotOrganisaatiosLoading
});

export default connect(mapStateToProps, {
    fetchOmattiedotOrganisaatios,
    setPalvelukayttajatCriteria,
    fetchPalvelukayttajat,
})(PalvelukayttajaHakuContainer)
