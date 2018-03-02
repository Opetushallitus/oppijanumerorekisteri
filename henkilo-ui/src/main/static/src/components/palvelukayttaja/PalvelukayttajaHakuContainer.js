// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { L } from '../../types/localisation.type'
import { updatePalvelukayttajaNavigation } from '../../actions/navigation.actions'
import { fetchOmattiedotOrganisaatios } from '../../actions/omattiedot.actions'
import { setPalvelukayttajatCriteria, fetchPalvelukayttajat } from '../../actions/palvelukayttaja.actions'
import PalvelukayttajaHakuPage from './PalvelukayttajaHakuPage'
import type { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer'
import type { OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types'

type Props = {
    L: L,
    palvelukayttajat: PalvelukayttajatState,
    omatOrganisaatiot: Array<OrganisaatioHenkilo>,
    fetchOmattiedotOrganisaatios: () => void,
    setPalvelukayttajatCriteria: (criteria: PalvelukayttajaCriteria) => void,
    fetchPalvelukayttajat: (criteria: PalvelukayttajaCriteria) => void,
    updatePalvelukayttajaNavigation: () => void,
}

class PalvelukayttajaHakuContainer extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        props.updatePalvelukayttajaNavigation()
    }

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios()
    }

    render() {
        return <PalvelukayttajaHakuPage
            L={this.props.L}
            organisaatiot={this.props.omatOrganisaatiot}
            onCriteriaChange={this.onCriteriaChange}
            palvelukayttajat={this.props.palvelukayttajat}
        />
    }

    onCriteriaChange = (criteria: PalvelukayttajaCriteria) => {
        this.props.setPalvelukayttajatCriteria(criteria)
        if (criteria.nameQuery) {
            this.props.fetchPalvelukayttajat(criteria)
        }
    }

}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    palvelukayttajat: state.palvelukayttajat,
    omatOrganisaatiot: state.omattiedot.organisaatios,
})

export default connect(mapStateToProps, {
    updatePalvelukayttajaNavigation,
    fetchOmattiedotOrganisaatios,
    setPalvelukayttajatCriteria,
    fetchPalvelukayttajat,
})(PalvelukayttajaHakuContainer)
