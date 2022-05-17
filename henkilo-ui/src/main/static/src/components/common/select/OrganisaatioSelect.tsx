import * as React from 'react';

import * as R from 'ramda';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../../utilities/organisaatio.util';
import { List } from 'react-virtualized';

import type { Locale } from '../../../types/locale.type';
import type { Localisations } from '../../../types/localisation.type';
import type { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioNameLookup } from '../../../reducers/organisaatio.reducer';

import './OrganisaatioSelect.css';

type Props = {
    organisaatiot: OrganisaatioHenkilo[];
    organisationNames: OrganisaatioNameLookup;
    locale: Locale;
    L: Localisations;
    onSelect: (organisaatio: OrganisaatioSelectObject) => void;
    onClose?: () => void;
};

type State = {
    searchWord: string;
    allOrganisaatiot: OrganisaatioSelectObject[];
    organisaatiot: OrganisaatioSelectObject[];
};

export default class OrganisaatioSelect extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const options = omattiedotOrganisaatiotToOrganisaatioSelectObject(
            this.props.organisaatiot,
            this.props.organisationNames,
            this.props.locale
        );
        const allOrganisaatiot = this._sortAlphabetically(options);
        this.state = {
            searchWord: '',
            allOrganisaatiot: allOrganisaatiot,
            organisaatiot: [...allOrganisaatiot],
        };
    }

    render() {
        return (
            <div className="organisaatio-select">
                <p className="oph-h3">{this.props.L['OMATTIEDOT_ORGANISAATIO_VALINTA']}</p>
                <input
                    className="oph-input"
                    placeholder={this.props.L['OMATTIEDOT_RAJAA_LISTAUSTA']}
                    type="text"
                    value={this.state.searchWord}
                    onChange={this.onFilter.bind(this)}
                />
                <List
                    className={'organisaatio-select-list'}
                    rowCount={this.state.organisaatiot.length}
                    rowRenderer={this._renderRow}
                    width={656}
                    height={700}
                    rowHeight={70}
                />
            </div>
        );
    }

    _renderRow = (renderParams: any) => {
        const organisaatio: OrganisaatioSelectObject = this.state.organisaatiot[renderParams.index];
        return (
            <div
                className="organisaatio"
                onClick={this.makeSelection.bind(this, organisaatio)}
                style={renderParams.style}
                key={organisaatio.oid}
            >
                {this._renderParents(organisaatio)}
                {this._renderOrganisaatioNimi(organisaatio)}
                {this._renderSuunniteltuNote(organisaatio)}
                {this._renderPassiivinenNote(organisaatio)}
            </div>
        );
    };

    makeSelection = (organisaatio: OrganisaatioSelectObject): void => {
        this.props.onSelect(organisaatio);
        this.props.onClose && this.props.onClose();
    };

    _renderOrganisaatioNimi = (organisaatio: OrganisaatioSelectObject) => {
        return (
            <div className="organisaatio-nimi">
                {organisaatio.name} {this._renderOrganisaatioTyypit(organisaatio)}
            </div>
        );
    };

    _renderOrganisaatioTyypit = (organisaatio: OrganisaatioSelectObject) => {
        return organisaatio.organisaatiotyypit && organisaatio.organisaatiotyypit.length > 0
            ? `(${organisaatio.organisaatiotyypit.toString()})`
            : null;
    };

    _renderParents = (organisaatio: OrganisaatioSelectObject): React.ReactNode =>
        organisaatio.parentNames.map((name) => (
            <span className="parent" key={name}>
                {name} &gt;{' '}
            </span>
        ));

    _renderSuunniteltuNote = (organisaatio: OrganisaatioSelectObject) =>
        organisaatio.status === 'SUUNNITELTU' ? (
            <div className="suunniteltu">{this.props.L['ORGANISAATIONVALINTA_SUUNNITELTU']}</div>
        ) : null;

    _renderPassiivinenNote = (organisaatio: OrganisaatioSelectObject) =>
        organisaatio.status === 'PASSIIVINEN' ? (
            <div className="passiivinen">{this.props.L['ORGANISAATIONVALINTA_PASSIIVINEN']}</div>
        ) : null;

    onFilter(event: React.SyntheticEvent<HTMLInputElement>) {
        const currentSearchWord: string = event.currentTarget.value;
        const previousSearchWord = this.state.searchWord;

        if (previousSearchWord.length > currentSearchWord.length) {
            if (this.state.allOrganisaatiot.length !== this.state.organisaatiot.length) {
                const organisaatiot = this._filterAndSortOrganisaatios(this.state.allOrganisaatiot, currentSearchWord);
                this.setState({ searchWord: currentSearchWord, organisaatiot });
            } else {
                this.setState({ searchWord: currentSearchWord });
            }
        } else {
            // optimize filtering if the new search searchword starts with the previous
            const organisaatiot = this._filterAndSortOrganisaatios(this.state.organisaatiot, currentSearchWord);
            this.setState({ searchWord: currentSearchWord, organisaatiot });
        }
    }

    _filterAndSortOrganisaatios(
        organisaatiot: OrganisaatioSelectObject[],
        searchWord: string
    ): OrganisaatioSelectObject[] {
        const containsSearchword = (organisaatio: OrganisaatioSelectObject) =>
            organisaatio.name.toLowerCase().includes(searchWord.toLowerCase());
        const startsWithSearchWord = (organisaatio: OrganisaatioSelectObject) =>
            organisaatio.name.toLowerCase().startsWith(searchWord.toLowerCase());
        const notStartingWithSearchWord = (organisaatio: OrganisaatioSelectObject) =>
            !organisaatio.name.toLowerCase().startsWith(searchWord.toLowerCase());

        const organisaatioFilteredBySearchword = this._organisaatiotFilteredBy(organisaatiot, containsSearchword);
        const organisaatiotStartingWithSearchword = this._organisaatiotFilteredBy(
            organisaatioFilteredBySearchword,
            startsWithSearchWord
        );
        const organisaatiotStartingWithSearchwordSortedByParentName = this._sortOrganisaatiotByParentName(
            organisaatiotStartingWithSearchword
        );
        const organisaatiotNotStartingWithSearchword = this._organisaatiotFilteredBy(
            organisaatioFilteredBySearchword,
            notStartingWithSearchWord
        );

        return [...organisaatiotStartingWithSearchwordSortedByParentName, ...organisaatiotNotStartingWithSearchword];
    }

    _sortAlphabetically(organisaatiot: OrganisaatioSelectObject[]): OrganisaatioSelectObject[] {
        return R.sortBy(R.compose(R.toLower, R.prop('name')))(organisaatiot);
    }

    _organisaatiotFilteredBy(
        organisaatiot: OrganisaatioSelectObject[],
        func: (organisaatio: OrganisaatioSelectObject) => boolean
    ): OrganisaatioSelectObject[] {
        return organisaatiot.filter(func);
    }

    _sortOrganisaatiotByParentName(organisaatiot: OrganisaatioSelectObject[]): OrganisaatioSelectObject[] {
        const hasParent = (organisaatio: OrganisaatioSelectObject) =>
            organisaatio.parentNames && organisaatio.parentNames.length > 0;
        const noParent = (organisaatio: OrganisaatioSelectObject) =>
            !organisaatio.parentNames || organisaatio.parentNames.length === 0;

        const organisaatiotHavingParents: any = this._organisaatiotFilteredBy(organisaatiot, hasParent);
        const organisaatiotNotHavingParents = this._organisaatiotFilteredBy(organisaatiot, noParent);

        return [
            ...organisaatiotNotHavingParents,
            ...R.sortBy(R.compose(R.toLower, R.last, R.prop('parentNames')))(organisaatiotHavingParents),
        ];
    }
}
