// @flow
import React from 'react';
import type {Locale} from "../../../types/locale.type";
import type {Organisaatio} from "../../../types/domain/organisaatio/organisaatio.types";
import type {L} from "../../../types/localisation.type";
import {organisaatioHierarkiaToOrganisaatioSelectObject} from "../../../utilities/organisaatio.util";
import type {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types";
import './OrganisaatioSelect.css';
import * as R from 'ramda';
import {List} from 'react-virtualized';

type Props = {
    locale: Locale,
    L: L,
    organisaatiot: Array<Organisaatio>,
    onSelect: (organisaatio: OrganisaatioSelectObject) => void,
}

type State = {
    searchWord: string,
    allOrganisaatiot: Array<OrganisaatioSelectObject>,
    organisaatiot: Array<OrganisaatioSelectObject>
}

export class OrganisaatioSelect extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        const allOrganisaatiot = this._sortAlphabetically(organisaatioHierarkiaToOrganisaatioSelectObject(props.organisaatiot, props.locale));
        this.state = {
            searchWord: '',
            allOrganisaatiot: allOrganisaatiot,
            organisaatiot: [...allOrganisaatiot]
        };
    }

    render() {
        return <div className="organisaatio-select">
            <h3>{this.props.L['OMATTIEDOT_ORGANISAATIO_VALINTA']}</h3>
            <input
                className="oph-input"
                placeholder={this.props.L['OMATTIEDOT_RAJAA_LISTAUSTA']}
                type="text"
                value={this.state.searchWord}
                onChange={this.onFilter.bind(this)}
            />
            <List className={"organisaatio-select-list"}
                  rowCount={this.state.organisaatiot.length}
                  rowRenderer={this._renderRow}
                  width={650}
                  height={700}
                  rowHeight={70}></List>
        </div>
    }

    _renderRow = (renderParams: any) => {
        const organisaatio: OrganisaatioSelectObject = this.state.organisaatiot[renderParams.index];
        return <div className="organisaatio" onClick={this.makeSelection.bind(this, organisaatio)} style={renderParams.style} key={organisaatio.oid}>
                {this._renderParents(organisaatio)}
                {this._renderOrganisaatioNimi(organisaatio)}
        </div>;
    };

    makeSelection = (organisaatio: OrganisaatioSelectObject): void => {
        this.props.onSelect(organisaatio);
    };

    onFilter(event: SyntheticEvent<HTMLInputElement>) {
        const currentSearchWord: string = event.currentTarget.value;
        const previousSearchWord = this.state.searchWord;

        if (previousSearchWord.length > currentSearchWord.length) {

            if (this.state.allOrganisaatiot.length !== this.state.organisaatiot.length) {
                const filteredOrganisaatiot = this._filterOrganisaatioList(this.state.allOrganisaatiot, currentSearchWord);
                const organisaatiot = this._sortBySearchWord(filteredOrganisaatiot, currentSearchWord);
                this.setState({searchWord: currentSearchWord, organisaatiot: organisaatiot});
            } else {
                this.setState({searchWord: currentSearchWord});
            }
        } else {
            // optimize filtering if the new search searchword starts with the previous
            const filterCurrentList: boolean = currentSearchWord.startsWith(previousSearchWord);
            const filteredOrganisaatiot = filterCurrentList ?
                this._filterOrganisaatioList(this.state.organisaatiot, currentSearchWord) :
                this._filterOrganisaatioList(this.state.allOrganisaatiot, currentSearchWord);
            const organisaatiot = this._sortBySearchWord(filteredOrganisaatiot, currentSearchWord);
            this.setState({searchWord: currentSearchWord, organisaatiot});
        }
    }

    _renderOrganisaatioNimi = (organisaatio: OrganisaatioSelectObject) => {
        return <div
            className="organisaatio-nimi">{organisaatio.name} ({this._renderOrganisaatioTyyppi(organisaatio)})</div>;
    };

    _renderOrganisaatioTyyppi = (organisaatio: OrganisaatioSelectObject) => {
        return organisaatio.organisaatiotyypit[0];
    };

    _renderParents = (organisaatio: OrganisaatioSelectObject) => {
        return organisaatio.parentNames.map((parent: string, index: number) =>
            <span key={index} className="parent">{parent} > </span>);
    };

    _filterOrganisaatioList(organisaatiot: Array<OrganisaatioSelectObject>, searchWord: string): Array<OrganisaatioSelectObject> {
        return organisaatiot.filter((organisaatio: OrganisaatioSelectObject) => organisaatio.name.toLowerCase().includes(searchWord.toLowerCase()));
    }

    _sortAlphabetically(organisaatiot: Array<OrganisaatioSelectObject>): Array<OrganisaatioSelectObject> {
        return R.sortBy(R.compose(R.toLower, R.prop('name')))(organisaatiot);
    }

    _sortBySearchWord(organisaatiot: Array<OrganisaatioSelectObject>, searchWord: string): Array<OrganisaatioSelectObject> {
        const organisaatiotStartingWithSearchword = organisaatiot.filter((organisaatio: OrganisaatioSelectObject) => organisaatio.name.toLowerCase().startsWith(searchWord.toLowerCase()));
        const organisaatiotStartingWithSearchwordSortedByParentName = this._sortOrganisaatiotByParentName(organisaatiotStartingWithSearchword);
        const others = organisaatiot.filter((organisaatio: OrganisaatioSelectObject) => !organisaatio.name.toLowerCase().startsWith(searchWord.toLowerCase()));
        return [...organisaatiotStartingWithSearchwordSortedByParentName, ...others];
    }

    _sortOrganisaatiotByParentName(organisaatiot: Array<any>): Array<OrganisaatioSelectObject> {
        const hasParent = organisaatiot.filter( (organisaatio: OrganisaatioSelectObject) => organisaatio.parentNames && organisaatio.parentNames.length > 0);
        const noParent = organisaatiot.filter( (organisaatio: OrganisaatioSelectObject) => !organisaatio.parentNames || organisaatio.parentNames.length === 0);
        return [...noParent, ...R.sortBy(R.compose(R.toLower, R.head, R.prop('parentNames')))(hasParent)];
    }


}