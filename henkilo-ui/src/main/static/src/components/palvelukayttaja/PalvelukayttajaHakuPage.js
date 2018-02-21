// @flow
import React from 'react'
import type { L } from '../../types/localisation.type'
import type { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer'
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput'
import PalvelukayttajaHakuTaulukko from './PalvelukayttajaHakuTaulukko';

type Props = {
    L: L,
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

}

export default PalvelukayttajaHakuPage
