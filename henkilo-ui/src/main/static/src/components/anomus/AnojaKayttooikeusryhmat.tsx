import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

import { AnojaKayttooikeusryhmaData, KayttooikeusryhmaData } from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import Loader from '../common/icons/Loader';
import './AnojaKayttoooikeusryhma.css';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { useLocalisations } from '../../selectors';
import OphTable from '../OphTable';

type Props = {
    data?: AnojaKayttooikeusryhmaData;
};

/*
 * Komponentti anomuslistaukseen näyttämään anojan olemassa olevat ja rauenneet käyttöoikeudet
 */
export const AnojaKayttooikeusryhmat = ({ data }: Props) => {
    const { L } = useLocalisations();
    const columns = useMemo<ColumnDef<KayttooikeusryhmaData>[]>(
        () => [
            {
                header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_MAIN_HEADER'],
                id: 'group',
                columns: [
                    {
                        header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'],
                        accessorFn: (row) => row.organisaatioNimi,
                        id: 'organisaatioNimi',
                    },
                    {
                        header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'],
                        accessorFn: (row) => row.kayttooikeusryhmaNimi,
                        id: 'kayttooikeusryhmaNimi',
                    },
                    {
                        header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_VOIMASSAPVM_HEADER'],
                        accessorFn: (row) => row.voimassaPvm,
                        id: 'voimassaPvm',
                    },
                ],
            },
        ],
        []
    );

    const table = useReactTable({
        data: data?.kayttooikeudet ?? [],
        pageCount: 1,
        getCoreRowModel: getCoreRowModel(),
        columns,
    });

    if (!data) {
        return (
            <div className="anoja-kayttooikeusryhmat">
                <Loader />
            </div>
        );
    } else if (data?.error) {
        return (
            <LocalNotification
                type={NOTIFICATIONTYPES.ERROR}
                title={L['NOTIFICATION_ANOMUKSEN_ANOJAN_OIKEUKSIEN_HAKU_VIRHE']}
                toggle={true}
            />
        );
    } else if (data?.kayttooikeudet.length > 0) {
        return <OphTable table={table} isLoading={false} />;
    }
    return (
        <LocalNotification
            type={NOTIFICATIONTYPES.INFO}
            title={L['NOTIFICATION_ANOMUKSEN_ANOJAN_KAYTTOOIKEUDET_TYHJA']}
            toggle={true}
        />
    );
};
