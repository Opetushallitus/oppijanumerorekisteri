import React from 'react';
import { AnojaKayttooikeusryhmaData, KayttooikeusryhmaData } from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import Loader from '../common/icons/Loader';
import { Locale } from '../../types/locale.type';
import { path } from 'ramda';
import './AnojaKayttoooikeusryhma.css';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { L10n } from '../../types/localisation.type';
import { localize } from '../../utilities/localisation.util';
import ReactTable from 'react-table';

type Props = {
    data: AnojaKayttooikeusryhmaData | null | undefined;
    locale: Locale;
    l10n: L10n;
};

/*
 * Komponentti anomuslistaukseen näyttämään anojan olemassa olevat ja rauenneet käyttöoikeudet
 */
export const AnojaKayttooikeusryhmat = (props: Props) => {
    const data: AnojaKayttooikeusryhmaData | null | undefined = path(['data'], props);
    const error: boolean | null | undefined = path(['data', 'error'], props);
    const kayttooikeudet: Array<KayttooikeusryhmaData> | null | undefined = path(['data', 'kayttooikeudet'], props);
    const headings = [
        {
            Header: props.l10n[props.locale]['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_MAIN_HEADER'],
            columns: [
                {
                    Header:
                        props.l10n[props.locale]['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'],
                    accessor: 'organisaatioNimi',
                },
                {
                    Header:
                        props.l10n[props.locale]['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'],
                    accessor: 'kayttooikeusryhmaNimi',
                },
                {
                    Header:
                        props.l10n[props.locale]['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_VOIMASSAPVM_HEADER'],
                    accessor: 'voimassaPvm',
                },
            ],
        },
    ];

    if (data === undefined) {
        return (
            <div className="anoja-kayttooikeusryhmat">
                <Loader />
            </div>
        );
    } else if (error) {
        return (
            <LocalNotification
                type={NOTIFICATIONTYPES.ERROR}
                title={localize('NOTIFICATION_ANOMUKSEN_ANOJAN_OIKEUKSIEN_HAKU_VIRHE', props.l10n, props.locale)}
                toggle={true}
            ></LocalNotification>
        );
    } else if (kayttooikeudet && kayttooikeudet.length > 0) {
        return (
            <div className="anoja-kayttooikeusryhmat">
                <ReactTable data={kayttooikeudet} columns={headings} showPagination={false} minRows={0}></ReactTable>
            </div>
        );
    }
    return (
        <LocalNotification
            type={NOTIFICATIONTYPES.INFO}
            title={localize('NOTIFICATION_ANOMUKSEN_ANOJAN_KAYTTOOIKEUDET_TYHJA', props.l10n, props.locale)}
            toggle={true}
        ></LocalNotification>
    );
};
