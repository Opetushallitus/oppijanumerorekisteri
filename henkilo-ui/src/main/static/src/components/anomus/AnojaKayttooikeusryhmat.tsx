import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import Loader from '../common/icons/Loader';
import './AnojaKayttoooikeusryhma.css';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { useLocalisations } from '../../selectors';
import OphTable from '../OphTable';
import { useGetKayttooikeusryhmasForHenkiloQuery, useGetOrganisationsQuery } from '../../api/kayttooikeus';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../utilities/localisation.util';

type KayttooikeusryhmaData = {
    voimassaPvm?: string;
    organisaatioNimi?: string;
    kayttooikeusryhmaNimi: string;
};

type Props = {
    henkiloOid: string;
};

const emptyData: KayttooikeusryhmaData[] = [];
const emptyColumns: ColumnDef<KayttooikeusryhmaData>[] = [];

/*
 * Komponentti anomuslistaukseen näyttämään anojan olemassa olevat ja rauenneet käyttöoikeudet
 */
export const AnojaKayttooikeusryhmat = ({ henkiloOid }: Props) => {
    const { L, locale } = useLocalisations();
    const { data: kayttooikeusryhmat, isLoading, isError } = useGetKayttooikeusryhmasForHenkiloQuery(henkiloOid);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();

    const _parseAnojaKayttooikeus = (myonnettyKayttooikeusryhma: MyonnettyKayttooikeusryhma): KayttooikeusryhmaData => {
        const kayttooikeusryhmaNimiTexts =
            myonnettyKayttooikeusryhma.ryhmaNames && myonnettyKayttooikeusryhma.ryhmaNames.texts;
        const kayttooikeusryhmaNimi = kayttooikeusryhmaNimiTexts
            ? localizeTextGroup(kayttooikeusryhmaNimiTexts, locale) || ''
            : '';
        const organisaatioNimi = _parseOrganisaatioNimi(myonnettyKayttooikeusryhma);
        return {
            voimassaPvm: _parseVoimassaPvm(myonnettyKayttooikeusryhma),
            organisaatioNimi: organisaatioNimi,
            kayttooikeusryhmaNimi: kayttooikeusryhmaNimi,
        };
    };

    const _parseOrganisaatioNimi = (myonnettyKayttooikeusryhma: MyonnettyKayttooikeusryhma): string | undefined => {
        const organisaatio =
            isSuccess && organisations.find((o) => o.oid === myonnettyKayttooikeusryhma.organisaatioOid);
        return organisaatio && organisaatio.nimi
            ? organisaatio.nimi[locale] ||
                  organisaatio.nimi['fi'] ||
                  organisaatio.nimi['en'] ||
                  organisaatio.nimi['sv'] ||
                  organisaatio.oid
            : L('HENKILO_AVOIMET_KAYTTOOIKEUDET_ORGANISAATIOTA_EI_LOYDY');
    };

    const _parseVoimassaPvm = (myonnettyKayttooikeusryhma: MyonnettyKayttooikeusryhma): string | undefined => {
        const noLoppupvm = L('HENKILO_AVOIMET_KAYTTOOIKEUDET_EI_LOPPUPVM');
        if (!myonnettyKayttooikeusryhma.voimassaPvm) {
            return noLoppupvm;
        } else if (myonnettyKayttooikeusryhma.tila !== KAYTTOOIKEUDENTILA.SULJETTU) {
            return myonnettyKayttooikeusryhma.voimassaPvm
                ? format(new Date(myonnettyKayttooikeusryhma.voimassaPvm), 'd.M.yyyy')
                : noLoppupvm;
        }
        return new Date(myonnettyKayttooikeusryhma.kasitelty).toString();
    };

    const columns = useMemo<ColumnDef<KayttooikeusryhmaData>[]>(
        () => [
            {
                header: () => L('HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_MAIN_HEADER'),
                id: 'group',
                columns: [
                    {
                        header: () => L('HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'),
                        accessorFn: (row) => row.organisaatioNimi,
                        id: 'organisaatioNimi',
                    },
                    {
                        header: () => L('HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'),
                        accessorFn: (row) => row.kayttooikeusryhmaNimi,
                        id: 'kayttooikeusryhmaNimi',
                    },
                    {
                        header: () => L('HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_VOIMASSAPVM_HEADER'),
                        accessorFn: (row) => row.voimassaPvm,
                        id: 'voimassaPvm',
                    },
                ],
            },
        ],
        []
    );

    const memoizedData = useMemo(() => {
        const renderedData =
            kayttooikeusryhmat
                ?.filter((myonnettyKayttooikeusryhma) => myonnettyKayttooikeusryhma.tila !== KAYTTOOIKEUDENTILA.ANOTTU)
                .map(_parseAnojaKayttooikeus) ?? [];
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [kayttooikeusryhmat]);

    const table = useReactTable({
        data: memoizedData ?? emptyData,
        pageCount: 1,
        getCoreRowModel: getCoreRowModel(),
        columns: columns ?? emptyColumns,
    });

    if (isLoading) {
        return (
            <div className="anoja-kayttooikeusryhmat">
                <Loader />
            </div>
        );
    } else if (isError) {
        return (
            <LocalNotification
                type="error"
                title={L('NOTIFICATION_ANOMUKSEN_ANOJAN_OIKEUKSIEN_HAKU_VIRHE')}
                toggle={true}
            />
        );
    } else if (memoizedData && memoizedData.length > 0) {
        return <OphTable table={table} isLoading={false} />;
    }
    return (
        <LocalNotification type="info" title={L('NOTIFICATION_ANOMUKSEN_ANOJAN_KAYTTOOIKEUDET_TYHJA')} toggle={true} />
    );
};
