// @flow
import React from 'react'
import type {L} from '../../types/localisation.type'
import type {PalvelukayttajaCriteria} from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type {PalvelukayttajatState} from '../../reducers/palvelukayttaja.reducer'
import type {OrganisaatioHenkilo} from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types'
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput'
import PalvelukayttajaHakuTaulukko from './PalvelukayttajaHakuTaulukko';
import SubOrganisationCheckbox from '../henkilohaku/criterias/SubOrganisationCheckbox';
import './PalvelukayttajaHakuPage.css'
import {
    findOrganisaatioSelectObjectByOid,
    omattiedotOrganisaatiotToOrganisaatioSelectObject
} from "../../utilities/organisaatio.util";
import {OrganisaatioSelectModal} from "../common/select/OrganisaatioSelectModal";
import type {OrganisaatioSelectObject} from "../../types/organisaatioselectobject.types";
import type {Locale} from "../../types/locale.type";
import CloseButton from "../common/button/CloseButton";

type PalvelukayttajaHakuPageProps = {
    L: L,
    locale: Locale,
    organisaatiot: Array<OrganisaatioHenkilo>,
    onCriteriaChange: (critera: PalvelukayttajaCriteria) => void,
    palvelukayttajat: PalvelukayttajatState,
    organisaatiotLoading: boolean
}

class PalvelukayttajaHakuPage extends React.Component<PalvelukayttajaHakuPageProps> {

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
        const organisaatiot = omattiedotOrganisaatiotToOrganisaatioSelectObject(this.props.organisaatiot, this.props.locale);
        const organisaatioSelection = this.props.palvelukayttajat.criteria.organisaatioOids ? findOrganisaatioSelectObjectByOid(this.props.palvelukayttajat.criteria.organisaatioOids, organisaatiot) : null;

        return <div className="PalvelukayttajaHakuPage-criteria">
            <DelayedSearchInput
                setSearchQueryAction={this.onNameQueryChange}
                defaultNameQuery={this.props.palvelukayttajat.criteria.nameQuery}
                loading={this.props.palvelukayttajat.loading}/>

            <div className="flex-horizontal organisaatiosuodatus">
                <div className="flex-item-1 valittu-organisaatio">
                    <input className="oph-input flex-item-1 " type="text"
                           value={organisaatioSelection ? organisaatioSelection.name : ''}
                           placeholder={this.props.L['PALVELUKAYTTAJA_HAKU_ORGANISAATIOSUODATUS']} readOnly/>
                </div>
                <OrganisaatioSelectModal
                    L={this.props.L}
                    locale={this.props.locale}
                    disabled={this.props.organisaatiotLoading}
                    organisaatiot={organisaatiot}
                    onSelect={this.onOrganisationChange}
                />
                <CloseButton closeAction={() => this.onOrganisationChange(undefined)}/>
            </div>

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
            this.props.onCriteriaChange({...this.props.palvelukayttajat.criteria, nameQuery: element.value})
        }
    };

    onSubOrganisationChange = (element: SyntheticEvent<HTMLInputElement>) => {
        this.props.onCriteriaChange({
            ...this.props.palvelukayttajat.criteria,
            subOrganisation: element.currentTarget.checked
        })
    };

    onOrganisationChange = (selection: ?OrganisaatioSelectObject) => {
        this.props.onCriteriaChange({
            ...this.props.palvelukayttajat.criteria,
            organisaatioOids: selection ? selection.oid : null
        })
    }

}

export default PalvelukayttajaHakuPage
