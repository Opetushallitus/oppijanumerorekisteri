// @flow
import React from 'react'
import type { L } from '../../types/localisation.type'
import type { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer'
import type { OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types'
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput'
import PalvelukayttajaHakuTaulukko from './PalvelukayttajaHakuTaulukko';
import OrganisaatioSelection from '../common/select/OrganisaatioSelection';
import SubOrganisationCheckbox from '../henkilohaku/criterias/SubOrganisationCheckbox';

type Props = {
    L: L,
    organisaatiot: Array<OrganisaatioHenkilo>,
    onCriteriaChange: (critera: PalvelukayttajaCriteria) => void,
    palvelukayttajat: PalvelukayttajatState,
}

class PalvelukayttajaHakuPage extends React.Component<Props> {

    render() {
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">{this.props.L['PALVELUKAYTTAJAN_HAKU_OTSIKKO']}</span>
                {this.renderCriteria()}
                {this.props.palvelukayttajat.dirty && this.renderData()}
            </div>
        )
    }

    renderCriteria() {
        return <div>
            <DelayedSearchInput
                setSearchQueryAction={this.onNameQueryChange}
                defaultNameQuery={this.props.palvelukayttajat.criteria.nameQuery}
                loading={this.props.palvelukayttajat.loading} />
            <OrganisaatioSelection
                placeholder={this.props.L['HENKILOHAKU_FILTERS_SUODATAORGANISAATIO']}
                organisaatios={this.props.organisaatiot}
                selectOrganisaatio={this.onOrganisationChange}
                selectedOrganisaatioOid={this.props.palvelukayttajat.criteria.organisaatioOids}
                clearable={true}
            />
            <SubOrganisationCheckbox
                L={this.props.L}
                subOrganisationValue={this.props.palvelukayttajat.criteria.subOrganisation}
                subOrganisationAction={this.onSubOrganisationChange}
            />
        </div>
    }

    renderData() {
        return <PalvelukayttajaHakuTaulukko
            L={this.props.L}
            palvelukayttajat={this.props.palvelukayttajat}
        />
    }

    onNameQueryChange = (element: HTMLInputElement) => {
        if (this.props.palvelukayttajat.criteria.nameQuery !== element.value) {
            this.props.onCriteriaChange({ ...this.props.palvelukayttajat.criteria, nameQuery: element.value })
        }
    }

    onSubOrganisationChange = (element: SyntheticEvent<HTMLInputElement>) => {
        this.props.onCriteriaChange({ ...this.props.palvelukayttajat.criteria, subOrganisation: element.currentTarget.checked })
    }

    onOrganisationChange = (selection: ?{label: string, value: string}) => {
        this.props.onCriteriaChange({ ...this.props.palvelukayttajat.criteria, organisaatioOids: selection ? selection.value : null })
    }

}

export default PalvelukayttajaHakuPage
