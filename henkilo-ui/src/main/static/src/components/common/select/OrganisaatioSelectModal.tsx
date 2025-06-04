import React, { useMemo, useState } from 'react';
import { compose, last, partition, prop, sortBy, toLower } from 'ramda';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { useLocalisations, useOmatOrganisaatiot } from '../../../selectors';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../../utilities/organisaatio.util';
import ValidationMessageButton from '../button/ValidationMessageButton';
import { SpinnerInButton } from '../icons/SpinnerInButton';
import OphModal from '../modal/OphModal';
import { useGetOrganisationNamesQuery } from '../../../api/kayttooikeus';

import './OrganisaatioSelect.css';

type OwnProps = {
    organisaatiot?: OrganisaatioHenkilo[];
    onSelect: (organisaatio: OrganisaatioSelectObject) => void;
    disabled?: boolean;
};

const OrganisaatioSelectModal = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: organisationNames } = useGetOrganisationNamesQuery();
    const omattiedotOrganisations = useOmatOrganisaatiot();
    const [isModalVisible, setModalVisible] = useState(false);
    const [searchWord, setSearchWord] = useState('');
    const [organisations, setOrganisations] = useState([]);
    const allOrganisations = useMemo(() => {
        const orgs = props.organisaatiot ?? omattiedotOrganisations;
        if (orgs?.length) {
            const options = omattiedotOrganisaatiotToOrganisaatioSelectObject(orgs, organisationNames, locale);
            const sortedOrganisations = sortBy<OrganisaatioSelectObject>(compose(toLower, prop('name')))(options);
            setOrganisations([...sortedOrganisations]);
            return sortedOrganisations;
        } else {
            return [];
        }
    }, [props.organisaatiot, omattiedotOrganisations, organisationNames, locale]);
    const isDisabled = props.disabled || !(props.organisaatiot ?? omattiedotOrganisations)?.length;

    const _renderRow = (renderParams: ListChildComponentProps) => {
        const organisaatio: OrganisaatioSelectObject = organisations[renderParams.index];
        return (
            <div
                className="organisaatio"
                onClick={() => {
                    props.onSelect(organisaatio);
                    setModalVisible(false);
                }}
                style={renderParams.style}
                key={organisaatio.oid}
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
                    <div className="suunniteltu">{L['ORGANISAATIONVALINTA_SUUNNITELTU']}</div>
                )}
                {organisaatio.status === 'PASSIIVINEN' && (
                    <div className="passiivinen">{L['ORGANISAATIONVALINTA_PASSIIVINEN']}</div>
                )}
            </div>
        );
    };

    function onFilter(event: React.SyntheticEvent<HTMLInputElement>) {
        const currentSearchWord: string = event.currentTarget.value;
        const previousSearchWord = searchWord;

        if (previousSearchWord.length > currentSearchWord.length) {
            if (allOrganisations.length !== organisations.length) {
                const newOrganisations = _filterAndSortOrganisaatios(allOrganisations, currentSearchWord);
                setSearchWord(currentSearchWord);
                setOrganisations(newOrganisations);
            } else {
                setSearchWord(currentSearchWord);
            }
        } else {
            // optimize filtering if the new search searchword starts with the previous
            const newOrganisations = _filterAndSortOrganisaatios(organisations, currentSearchWord);
            setSearchWord(currentSearchWord);
            setOrganisations(newOrganisations);
        }
    }

    function _filterAndSortOrganisaatios(
        organisations: OrganisaatioSelectObject[],
        searchWord: string
    ): OrganisaatioSelectObject[] {
        const containsSearchword = (organisaatio: OrganisaatioSelectObject) =>
            organisaatio.name.toLowerCase().includes(searchWord.toLowerCase());
        const startsWithSearchWord = (organisaatio: OrganisaatioSelectObject) =>
            organisaatio.name.toLowerCase().startsWith(searchWord.toLowerCase());
        const notStartingWithSearchWord = (organisaatio: OrganisaatioSelectObject) =>
            !organisaatio.name.toLowerCase().startsWith(searchWord.toLowerCase());

        const organisaatioFilteredBySearchword = organisations.filter(containsSearchword);
        const organisaatiotStartingWithSearchword = organisaatioFilteredBySearchword.filter(startsWithSearchWord);
        const organisaatiotStartingWithSearchwordSortedByParentName = _sortOrganisaatiotByParentName(
            organisaatiotStartingWithSearchword
        );
        const organisaatiotNotStartingWithSearchword =
            organisaatioFilteredBySearchword.filter(notStartingWithSearchWord);

        return [...organisaatiotStartingWithSearchwordSortedByParentName, ...organisaatiotNotStartingWithSearchword];
    }

    function _sortOrganisaatiotByParentName(organisations: OrganisaatioSelectObject[]): OrganisaatioSelectObject[] {
        const [organisaatiotHavingParents, organisaatiotNotHavingParents] = partition(
            (o) => o.parentNames && o.parentNames.length > 0,
            organisations
        );

        return [
            ...organisaatiotNotHavingParents,
            ...sortBy<OrganisaatioSelectObject>(compose(toLower, last, prop('parentNames')))(
                organisaatiotHavingParents
            ),
        ];
    }

    return (
        <>
            <ValidationMessageButton
                disabled={isDisabled}
                validationMessages={{}}
                buttonAction={() => setModalVisible(true)}
            >
                <SpinnerInButton show={isDisabled} /> {L['OMATTIEDOT_VALITSE_ORGANISAATIO']}
            </ValidationMessageButton>
            {isModalVisible && (
                <OphModal onClose={() => setModalVisible(false)}>
                    <div className="organisaatio-select">
                        <p className="oph-h3">{L['OMATTIEDOT_ORGANISAATIO_VALINTA']}</p>
                        <input
                            name="org"
                            className="oph-input"
                            placeholder={L['OMATTIEDOT_RAJAA_LISTAUSTA']}
                            type="text"
                            value={searchWord}
                            onChange={onFilter}
                        />
                        <FixedSizeList
                            className="organisaatio-select-list"
                            itemCount={organisations.length}
                            width={656}
                            height={700}
                            itemSize={70}
                        >
                            {_renderRow}
                        </FixedSizeList>
                    </div>
                </OphModal>
            )}
        </>
    );
};

export default OrganisaatioSelectModal;
