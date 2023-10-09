import React, { useState } from 'react';
import moment from 'moment';

import './KutsututTable.css';
import Table from '../common/table/Table';
import Button from '../common/button/Button';
import { renewKutsu } from '../../actions/kutsu.actions';
import { toLocalizedText } from '../../localizabletext';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { addGlobalNotification } from '../../actions/notification.actions';
import PopupButton from '../common/button/PopupButton';
import KutsuDetails from './KutsuDetails';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import { useLocalisations } from '../../selectors';
import { useAppDispatch } from '../../store';

type Sort = {
    id: string;
    desc: string;
};

type OwnProps = {
    kutsus: Array<KutsuRead>;
    isLoading: boolean;
    allFetched: boolean;
    fetchKutsus: (sort?: Sort, shouldNotClear?: boolean) => void;
    cancelInvitation: (kutsu: KutsuRead) => (arg0: React.MouseEvent<HTMLElement>) => void;
};

const KutsututTable = (props: OwnProps) => {
    const [sorted, setSorted] = useState({ id: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO', desc: 'true' });
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();

    const headings = [
        { key: 'KUTSUT_NIMI_OTSIKKO', label: L['KUTSUT_NIMI_OTSIKKO'] },
        {
            key: 'KUTSUT_SAHKOPOSTI_OTSIKKO',
            label: L['KUTSUT_SAHKOPOSTI_OTSIKKO'],
        },
        {
            key: 'KUTSUTUT_ORGANISAATIO_OTSIKKO',
            label: L['KUTSUTUT_ORGANISAATIO_OTSIKKO'],
            notSortable: true,
        },
        {
            key: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO',
            label: L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO'],
        },
        {
            key: 'KUTSUTUT_SAATE_OTSIKKO',
            label: L['KUTSUTUT_SAATE_OTSIKKO'],
            maxWidth: 100,
            notSortable: true,
        },
        {
            key: 'KUTSUTUT_LAHETA_UUDELLEEN',
            label: L['KUTSUTUT_LAHETA_UUDELLEEN'],
            notSortable: true,
        },
        {
            key: 'KUTSU_PERUUTA',
            label: L['KUTSUTUT_PERUUTA_KUTSU'],
            notSortable: true,
        },
    ];

    const data = props.kutsus.map((kutsu) => ({
        id: kutsu.id,
        KUTSUT_NIMI_OTSIKKO: createNimiCell(kutsu),
        KUTSUT_SAHKOPOSTI_OTSIKKO: createSahkopostiCell(kutsu),
        KUTSUTUT_ORGANISAATIO_OTSIKKO: createOrganisaatiotCell(kutsu),
        KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO: createKutsuLahetettyCell(kutsu),
        KUTSUTUT_SAATE_OTSIKKO: createSaateCell(kutsu),
        KUTSUTUT_LAHETA_UUDELLEEN: createResendCell(kutsu),
        KUTSU_PERUUTA: createPeruutaCell(kutsu),
    }));

    function createNimiCell(kutsu: KutsuRead) {
        return `${kutsu.etunimi} ${kutsu.sukunimi}`;
    }

    function createSahkopostiCell(kutsu: KutsuRead) {
        return kutsu.sahkoposti;
    }

    function createOrganisaatiotCell(kutsu: KutsuRead) {
        return (
            <div>
                {kutsu.organisaatiot.map((org) => (
                    <div key={org.organisaatioOid}>{toLocalizedText(locale, org.nimi) || org.organisaatioOid}</div>
                ))}
            </div>
        );
    }

    function createSaateCell(kutsu: KutsuRead) {
        return kutsu.saate ? (
            <PopupButton
                popupClass={'oph-popup-default oph-popup-bottom'}
                popupButtonWrapperPositioning={'absolute'}
                popupArrowStyles={{ marginLeft: '10px' }}
                popupButtonClasses={'oph-button oph-button-ghost'}
                popupStyle={{
                    left: '-20px',
                    width: '20rem',
                    padding: '30px',
                    position: 'absolute',
                }}
                simple={true}
                popupContent={<p>{kutsu.saate}</p>}
            >
                {L['AVAA']}
            </PopupButton>
        ) : null;
    }

    function createKutsuLahetettyCell(kutsu: KutsuRead) {
        const sent = moment(new Date(kutsu.aikaleima));
        return (
            <span>
                {sent.format('DD/MM/YYYY H:mm')}{' '}
                {sent.add(1, 'months').isBefore(moment()) ? (
                    <span className="oph-red">{L['KUTSUTUT_VIRKAILIJAT_KUTSU_VANHENTUNUT']}</span>
                ) : null}
            </span>
        );
    }

    function createResendCell(kutsu: KutsuRead) {
        const resendAction = async () => {
            await dispatch<any>(renewKutsu(kutsu.id));
            dispatch(
                addGlobalNotification({
                    key: 'KUTSU_CONFIRMATION_SUCCESS',
                    type: NOTIFICATIONTYPES.SUCCESS,
                    autoClose: 10000,
                    title: L['KUTSU_LUONTI_ONNISTUI'],
                })
            );
            props.fetchKutsus(sorted);
        };
        return kutsu.tila === 'AVOIN' && <Button action={resendAction}>{L['KUTSUTUT_LAHETA_UUDELLEEN_NAPPI']}</Button>;
    }

    function createPeruutaCell(kutsu: KutsuRead) {
        return (
            kutsu.tila === 'AVOIN' && (
                <Button cancel action={props.cancelInvitation(kutsu)}>
                    {L['KUTSUTUT_PERUUTA_KUTSU_NAPPI']}
                </Button>
            )
        );
    }

    function onTableFetch(tableState: { sorted: Sort[] }) {
        const newSort = tableState.sorted[0];
        // Update sort state
        if (newSort) {
            setSorted(newSort);
            if (!sorted || newSort.id !== sorted.id || newSort.desc !== sorted.desc) {
                props.fetchKutsus(newSort);
            }
        }
    }

    function onSubmitWithoutClear() {
        props.fetchKutsus(sorted, true);
    }

    return (
        <div className="kutsututTableWrapper oph-table">
            <Table
                headings={headings}
                noDataText={L['KUTSUTUT_VIRKAILIJAT_TYHJA']}
                data={data}
                striped
                resizable
                manual={true}
                defaultSorted={[sorted]}
                onFetchData={onTableFetch}
                fetchMoreSettings={{
                    isActive: !props.allFetched && !props.isLoading,
                    fetchMoreAction: onSubmitWithoutClear,
                }}
                isLoading={props.isLoading}
                subComponent={(row) => (
                    <KutsuDetails kutsu={props.kutsus.find((kutsu) => kutsu.id === row.original.id)} />
                )}
            />
        </div>
    );
};

export default KutsututTable;
