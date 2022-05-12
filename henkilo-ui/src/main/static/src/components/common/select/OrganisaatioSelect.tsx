import * as React from 'react';
import { connect } from 'react-redux';
import { Locale } from '../../../types/locale.type';
import { Localisations } from '../../../types/localisation.type';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import './OrganisaatioSelect.css';
import * as R from 'ramda';
import { List } from 'react-virtualized';
import type { OrganisaatioNameLookup } from '../../../reducers/organisaatio.reducer';
import type { RootState } from '../../../reducers';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../../utilities/organisaatio.util';

type OwnProps = {
    organisaatiot: OrganisaatioHenkilo[];
    onSelect: (organisaatio: OrganisaatioSelectObject) => void;
    onClose?: () => void;
};

type StateProps = {
    options: OrganisaatioSelectObject[];
    organisationNames: OrganisaatioNameLookup;
    locale: Locale;
    L: Localisations;
};

type State = {
    searchWord: string;
    allOrganisaatiot: OrganisaatioSelectObject[];
    organisaatiot: OrganisaatioSelectObject[];
};

type Props = OwnProps & StateProps;

class OrganisaatioSelect extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const allOrganisaatiot = this._sortAlphabetically(this.props.options);
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
        if (this.props.onClose) {
            this.props.onClose();
        }
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

    _resolveName = (oid: string, locale: string): string => this.props.organisationNames?.[oid]?.[locale] || oid;

    _renderParents = (organisaatio: OrganisaatioSelectObject): React.ReactNode => {
        const path = organisaatio.oidPath.split('/');
        path.shift();
        return path.map((oid) => (
            <span key={oid} className="parent">
                {this._resolveName(oid, this.props.locale)} &gt;{' '}
            </span>
        ));
    };

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

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    organisationNames: state.organisaatio.names,
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    options: omattiedotOrganisaatiotToOrganisaatioSelectObject(
        ownProps.organisaatiot ? ownProps.organisaatiot : state.omattiedot.organisaatios,
        state.locale
    ),
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(OrganisaatioSelect);
