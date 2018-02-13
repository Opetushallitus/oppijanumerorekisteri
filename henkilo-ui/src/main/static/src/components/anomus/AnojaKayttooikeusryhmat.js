// @flow

import React from 'react';
import type {
    AnojaKayttooikeusryhmaData,
    KayttooikeusryhmaData
} from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import Loader from "../common/icons/Loader";
import type {Locale} from "../../types/locale.type";
import {path} from 'ramda';
import './AnojaKayttoooikeusryhma.css';
import {LocalNotification} from "../common/Notification/LocalNotification";
import {NOTIFICATIONTYPES} from "../common/Notification/notificationtypes";
import type {L10n} from "../../types/localisation.type";
import {localize} from "../../utilities/localisation.util";
import ReactTable from 'react-table'

type Props = {
    data: ?AnojaKayttooikeusryhmaData,
    locale: Locale,
    l10n: L10n
};


/*
 * Komponentti anomuslistaukseen näyttämään anojan olemassa olevat ja rauenneet käyttöoikeudet
 */
export const AnojaKayttooikeusryhmat = (props: Props) => {
    const data: ?AnojaKayttooikeusryhmaData = path(['data'], props);
    const error: ?boolean = path(['data', 'error'], props);
    const kayttooikeudet: ?Array<KayttooikeusryhmaData> = path(['data', 'kayttooikeudet'], props);
    const headings = [
        {
            Header: 'Anojan olemassa olevat ja vanhentuneet käyttöoikeudet',
            columns: [
            {
                Header: 'Organisaatio nimi',
                accessor: 'organisaatioNimi'
            },
            {
                Header: 'Kayttöoikeuden nimi',
                accessor: 'kayttooikeusryhmaNimi'
            },
            {
                Header: 'Käyttöoikeuden päättymispäivämäärä',
                accessor: 'voimassaPvm'
            }]
        }
    ];
    
    if(data === undefined) {
        return  <div className="anoja-kayttooikeusryhmat"><Loader/></div>;
    } else if(error) {
        return <LocalNotification type={NOTIFICATIONTYPES.ERROR}
                                  title={localize('NOTIFICATION_ANOMUKSEN_ANOJAN_OIKEUKSIEN_HAKU_VIRHE', props.l10n, props.locale)}
                                  toggle={true}></LocalNotification>
    } else if(kayttooikeudet && kayttooikeudet.length > 0) {
        return  <div className="anoja-kayttooikeusryhmat">
                    <ReactTable
                        data={kayttooikeudet}
                        columns={headings}
                        showPagination={false}
                        minRows={0}></ReactTable>
                </div>;
    }
    return <LocalNotification type={NOTIFICATIONTYPES.INFO}
                              title={localize('NOTIFICATION_ANOMUKSEN_ANOJAN_KAYTTOOIKEUDET_TYHJA', props.l10n, props.locale)}
                              toggle={true}></LocalNotification>
};

