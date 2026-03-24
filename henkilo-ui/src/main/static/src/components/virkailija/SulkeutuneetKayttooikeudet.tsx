import React, { useId, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';

import { getOrganisationNameWithType } from '../common/StaticUtils';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';
import { useLocalisations } from '../../selectors';
import { useGetKayttooikeusryhmasForHenkiloQuery, useGetOrganisationsQuery } from '../../api/kayttooikeus';
import OphModal from '../common/modal/OphModal';
import { OphDsTable, SortOrder } from '../design-system/OphDsTable';

type OwnProps = {
    oidHenkilo: string;
};

type KayttooikeusDetails = {
    name: string;
    description: string;
};

type RenderedData = (MyonnettyKayttooikeusryhma & {
    organisaatioNimi: string;
    ryhmaNimi: string;
    tilaTxt: string;
    kasittely: string;
})[];

export const SulkeutuneetKayttooikeudet = (props: OwnProps) => {
    const [sortOrder, setSortOrder] = useState<SortOrder>();
    const { L, locale } = useLocalisations();
    const { data: kayttooikeusryhmas, isLoading } = useGetKayttooikeusryhmasForHenkiloQuery(props.oidHenkilo);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const [kayttooikeus, setKayttooikeus] = useState<KayttooikeusDetails>();

    function showKayttooikeusDetails(kayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        setKayttooikeus({
            name: getTextGroupLocalisation(kayttooikeusRyhma.ryhmaNames, locale),
            description: getTextGroupLocalisation(kayttooikeusRyhma.ryhmaKuvaus, locale),
        });
    }

    function _filterExistingKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila === KAYTTOOIKEUDENTILA.SULJETTU || kayttooikeus.tila === KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    const renderedData: RenderedData = useMemo(() => {
        const renderedData = (kayttooikeusryhmas ?? []).filter(_filterExistingKayttooikeus).map((k) => ({
            ...k,
            organisaatioNimi: getOrganisationNameWithType(organisations, k.organisaatioOid, L, locale),
            ryhmaNimi: k.ryhmaNames?.texts.filter((text) => text.lang === locale.toUpperCase())[0]?.text ?? '',
            tilaTxt: L(k.tila),
            kasittely: format(parseISO(k.kasitelty), 'd.M.yyyy') + ' / ' + (k.kasittelijaNimi || k.kasittelijaOid),
        }));
        if (sortOrder) {
            const { sortBy, asc } = sortOrder;
            switch (sortBy) {
                case L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO'):
                    renderedData?.sort((a, b) =>
                        asc
                            ? a.organisaatioNimi.localeCompare(b.organisaatioNimi)
                            : b.organisaatioNimi.localeCompare(a.organisaatioNimi)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'):
                    renderedData?.sort((a, b) =>
                        asc ? a.ryhmaNimi.localeCompare(b.ryhmaNimi) : b.ryhmaNimi.localeCompare(a.ryhmaNimi)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_TILA'):
                    renderedData?.sort((a, b) =>
                        asc ? a.tilaTxt.localeCompare(b.tilaTxt) : b.tilaTxt.localeCompare(a.tilaTxt)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_KASITTELIJA'):
                    renderedData?.sort((a, b) =>
                        asc ? a.kasitelty.localeCompare(b.kasitelty) : b.kasitelty.localeCompare(a.kasitelty)
                    );
                    break;
            }
        }
        return renderedData;
    }, [kayttooikeusryhmas, organisations, isSuccess, sortOrder]);

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L('HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO')}</h2>
            {kayttooikeus && (
                <OphModal
                    title={kayttooikeus.name}
                    onClose={() => setKayttooikeus(undefined)}
                    onOverlayClick={() => setKayttooikeus(undefined)}
                >
                    <p>{kayttooikeus.description}</p>
                </OphModal>
            )}
            {!isLoading && renderedData.length === 0 ? (
                <p>{L('EI_SULKEUTUNEITA_KAYTTOOIKEUKSIA')}</p>
            ) : (
                <OphDsTable
                    headers={[
                        L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO'),
                        L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'),
                        L('HENKILO_KAYTTOOIKEUS_TILA'),
                        L('HENKILO_KAYTTOOIKEUS_KASITTELIJA'),
                    ]}
                    rows={renderedData.map((k) => [
                        k.organisaatioNimi,
                        <button
                            key={`details-${k.ryhmaId}`}
                            className="oph-ds-button oph-ds-button-transparent oph-ds-button-text-link"
                            onClick={() => showKayttooikeusDetails(k)}
                        >
                            {k.ryhmaNimi}
                        </button>,
                        k.tilaTxt,
                        k.kasittely,
                    ])}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    isFetching={isLoading}
                />
            )}
        </section>
    );
};
