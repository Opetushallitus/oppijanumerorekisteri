import React, { useMemo, useState } from 'react';
import { List, RowComponentProps } from 'react-window';

import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import type { LocalisationFn } from '../../../types/localisation.type';
import { useLocalisations, useOmatOrganisaatiot } from '../../../selectors';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../../utilities/organisaatio.util';
import { SpinnerInButton } from '../icons/SpinnerInButton';
import OphModal from '../modal/OphModal';
import { useGetOrganisationNamesQuery } from '../../../api/kayttooikeus';
import Button from '../button/Button';

import './OrganisaatioSelect.css';

type OwnProps = {
    organisaatiot?: OrganisaatioHenkilo[];
    onSelect: (organisaatio: OrganisaatioSelectObject) => void;
    disabled?: boolean;
};

type OrganisaatioRowProps = {
    organisations: OrganisaatioSelectObject[];
    onSelect: (organisaatio: OrganisaatioSelectObject) => void;
    closeModal: () => void;
    L: LocalisationFn;
};

const OrganisaatioRow = ({
    index,
    style,
    organisations,
    onSelect,
    closeModal,
    L,
}: RowComponentProps<OrganisaatioRowProps>) => {
    const organisaatio = organisations[index];
    if (!organisaatio) {
        return null;
    }
    return (
        <div
            className="organisaatio"
            onClick={() => {
                onSelect(organisaatio);
                closeModal();
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(organisaatio);
                    closeModal();
                }
            }}
            style={style}
            role="button"
            tabIndex={0}
        >
            {organisaatio.parentNames.map((name, i) => (
                <span className="parent" key={i}>
                    {name} &gt;{' '}
                </span>
            ))}
            <div className="organisaatio-nimi">
                {organisaatio.name}{' '}
                {organisaatio.organisaatiotyypit?.length > 0 && `(${organisaatio.organisaatiotyypit.toString()})`}
            </div>
            {organisaatio.status === 'SUUNNITELTU' && (
                <div className="suunniteltu">{L('ORGANISAATIONVALINTA_SUUNNITELTU')}</div>
            )}
            {organisaatio.status === 'PASSIIVINEN' && (
                <div className="passiivinen">{L('ORGANISAATIONVALINTA_PASSIIVINEN')}</div>
            )}
        </div>
    );
};

const OrganisaatioSelectModal = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: organisationNames } = useGetOrganisationNamesQuery();
    const omattiedotOrganisations = useOmatOrganisaatiot();
    const [isModalVisible, setModalVisible] = useState(false);
    const [searchWord, setSearchWord] = useState('');
    const [organisations, setOrganisations] = useState<OrganisaatioSelectObject[]>([]);
    const allOrganisations = useMemo(() => {
        const orgs = props.organisaatiot ?? omattiedotOrganisations;
        if (orgs?.length && organisationNames) {
            const options = omattiedotOrganisaatiotToOrganisaatioSelectObject(orgs, organisationNames, locale);
            options.sort((a, b) => (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1));
            setOrganisations([...options]);
            return options;
        } else {
            return [];
        }
    }, [props.organisaatiot, omattiedotOrganisations, organisationNames, locale]);
    const isDisabled = props.disabled || !(props.organisaatiot ?? omattiedotOrganisations)?.length;

    function onFilter(event: React.SyntheticEvent<HTMLInputElement>) {
        const currentSearchWord: string = event.currentTarget.value;
        const previousSearchWord = searchWord;

        if (previousSearchWord.length > currentSearchWord.length) {
            if (allOrganisations.length !== organisations.length) {
                const newOrganisations = filterAndSortOrganisaatios(allOrganisations, currentSearchWord);
                setSearchWord(currentSearchWord);
                setOrganisations(newOrganisations);
            } else {
                setSearchWord(currentSearchWord);
            }
        } else {
            // optimize filtering if the new search searchword starts with the previous
            const newOrganisations = filterAndSortOrganisaatios(organisations, currentSearchWord);
            setSearchWord(currentSearchWord);
            setOrganisations(newOrganisations);
        }
    }

    return (
        <>
            <Button
                className="organisaatio-select-modal-button"
                disabled={isDisabled}
                action={() => setModalVisible(true)}
            >
                <SpinnerInButton show={!(props.organisaatiot ?? omattiedotOrganisations)?.length} />{' '}
                {L('OMATTIEDOT_VALITSE_ORGANISAATIO')}
            </Button>
            {isModalVisible && (
                <OphModal onClose={() => setModalVisible(false)}>
                    <div className="organisaatio-select">
                        <p className="oph-h3">{L('OMATTIEDOT_ORGANISAATIO_VALINTA')}</p>
                        <input
                            name="org"
                            className="oph-input organisaatio-select-filter-input"
                            placeholder={L('OMATTIEDOT_RAJAA_LISTAUSTA')}
                            type="text"
                            value={searchWord}
                            onChange={onFilter}
                        />
                        <List
                            className="organisaatio-select-list"
                            rowComponent={OrganisaatioRow}
                            rowCount={organisations.length}
                            rowHeight={70}
                            rowProps={{
                                organisations,
                                onSelect: props.onSelect,
                                closeModal: () => setModalVisible(false),
                                L,
                            }}
                            style={{ height: 700 }}
                        />
                    </div>
                </OphModal>
            )}
        </>
    );
};

export function containsSearchword(searchWord: string) {
    return (organisaatio: OrganisaatioSelectObject) =>
        organisaatio.name.toLowerCase().includes(searchWord.toLowerCase());
}

export function filterAndSortOrganisaatios(
    organisations: OrganisaatioSelectObject[],
    searchWord: string
): OrganisaatioSelectObject[] {
    const sorter = combinedSort(sortStartingWithFirst(searchWord), sortParentlessFirst(), sortByParentName());

    return sorter(organisations.filter(containsSearchword(searchWord)));
}

type OrganisaatioSelectObjectSorter = (a: OrganisaatioSelectObject, b: OrganisaatioSelectObject) => number;

function sortStartingWithFirst(search: string): OrganisaatioSelectObjectSorter {
    return (a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(search.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(search.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        else if (!aStartsWith && bStartsWith) return 1;
        else return 0;
    };
}

function combinedSort<T>(...sorters: ((a: T, b: T) => number)[]) {
    return (items: unknown) => {
        const copy = JSON.parse(JSON.stringify(items));
        copy.sort((a: T, b: T): number => {
            for (const fn of sorters) {
                const result = fn(a, b);
                if (result !== 0) return result;
            }
            return 0;
        });
        return copy;
    };
}

function sortParentlessFirst(): OrganisaatioSelectObjectSorter {
    return (a, b) => {
        if (!hasParents(a) && hasParents(b)) return -1;
        if (hasParents(a) && !hasParents(b)) return 1;
        else return 0;
    };
}

function sortByParentName(): OrganisaatioSelectObjectSorter {
    return (a, b) => parentName(a).localeCompare(parentName(b));
}

function hasParents(o: OrganisaatioSelectObject): boolean {
    return o.parentNames?.length > 0;
}

function parentName(o: OrganisaatioSelectObject): string {
    if (hasParents(o)) {
        return o.parentNames[o.parentNames.length - 1]!.toLocaleLowerCase();
    } else {
        return o.name;
    }
}

export default OrganisaatioSelectModal;
