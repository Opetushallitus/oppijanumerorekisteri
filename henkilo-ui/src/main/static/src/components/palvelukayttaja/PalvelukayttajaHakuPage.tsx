import React from 'react';
import { Localisations } from '../../types/localisation.type';
import { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types';
import { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer';
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput';
import PalvelukayttajaHakuTaulukko from './PalvelukayttajaHakuTaulukko';
import SubOrganisationCheckbox from '../henkilohaku/criterias/SubOrganisationCheckbox';
import './PalvelukayttajaHakuPage.css';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { Locale } from '../../types/locale.type';
import CloseButton from '../common/button/CloseButton';

type PalvelukayttajaHakuPageProps = {
    L: Localisations;
    locale: Locale;
    onCriteriaChange: (critera: PalvelukayttajaCriteria) => void;
    palvelukayttajat: PalvelukayttajatState;
};

class PalvelukayttajaHakuPage extends React.Component<PalvelukayttajaHakuPageProps> {
    render() {
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">{this.props.L['PALVELUKAYTTAJAN_HAKU_OTSIKKO']}</span>
                {this.renderCriteria()}
                {this.props.palvelukayttajat.dirty && this.renderData()}
            </div>
        );
    }

    renderCriteria() {
        return (
            <div className="PalvelukayttajaHakuPage-criteria">
                <DelayedSearchInput
                    setSearchQueryAction={this.onNameQueryChange.bind(this)}
                    defaultNameQuery={this.props.palvelukayttajat.criteria.nameQuery}
                    loading={this.props.palvelukayttajat.loading}
                />

                <div className="flex-horizontal organisaatiosuodatus">
                    <div className="flex-item-1 valittu-organisaatio">
                        <input
                            className="oph-input flex-item-1 "
                            type="text"
                            value={this.props.palvelukayttajat.criteria.selection?.name || ''}
                            placeholder={this.props.L['PALVELUKAYTTAJA_HAKU_ORGANISAATIOSUODATUS']}
                            readOnly
                        />
                    </div>
                    <OrganisaatioSelectModal onSelect={this.onOrganisationChange} />
                    <CloseButton closeAction={() => this.onOrganisationChange(undefined)} />
                </div>

                <SubOrganisationCheckbox
                    L={this.props.L}
                    subOrganisationValue={this.props.palvelukayttajat.criteria.subOrganisation}
                    subOrganisationAction={this.onSubOrganisationChange}
                />
            </div>
        );
    }

    renderData() {
        return <PalvelukayttajaHakuTaulukko L={this.props.L} palvelukayttajat={this.props.palvelukayttajat} />;
    }

    onNameQueryChange = (nameQuery: string) => {
        if (this.props.palvelukayttajat.criteria.nameQuery !== nameQuery) {
            this.props.onCriteriaChange({
                ...this.props.palvelukayttajat.criteria,
                nameQuery,
            });
        }
    };

    onSubOrganisationChange = (element: React.SyntheticEvent<HTMLInputElement>) => {
        this.props.onCriteriaChange({
            ...this.props.palvelukayttajat.criteria,
            subOrganisation: element.currentTarget.checked,
        });
    };

    onOrganisationChange = (selection?: OrganisaatioSelectObject) => {
        this.props.onCriteriaChange({
            ...this.props.palvelukayttajat.criteria,
            selection,
        });
    };
}

export default PalvelukayttajaHakuPage;
