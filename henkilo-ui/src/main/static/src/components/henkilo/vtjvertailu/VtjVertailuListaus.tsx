import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

import './VtjVertailuListaus.css';
import { useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { useGetYksilointitiedotQuery } from '../../../api/oppijanumerorekisteri';
import { Henkilo } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Yhteystieto } from '../../../types/domain/oppijanumerorekisteri/yhteystieto.types';

type Props = {
    henkilo: Henkilo;
};

type HenkiloData = {
    etunimet?: string;
    sukunimi?: string;
    kutsumanimi?: string;
    sukupuoli?: string;
    yhteystiedotRyhma?: YhteystietoRyhma[];
    palvelu: string;
};

const emptyData: HenkiloData[] = [];
const emptyColumns: ColumnDef<HenkiloData>[] = [];

const VtjVertailuListaus = ({ henkilo }: Props) => {
    const { L } = useLocalisations();
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(henkilo.oidHenkilo);

    function renderSukupuoli(henkilo: HenkiloData) {
        if (henkilo.sukupuoli === '1') {
            return L('HENKILO_VTJ_SUKUPUOLI_MIES');
        } else if (henkilo.sukupuoli === '2') {
            return L('HENKILO_VTJ_SUKUPUOLI_NAINEN');
        } else {
            return '';
        }
    }

    function renderYhteystiedotRyhma(henkilo: HenkiloData) {
        const yhteystiedot = henkilo.yhteystiedotRyhma
            ? henkilo.yhteystiedotRyhma
                  .reduce<Yhteystieto[]>((accumulator, current) => accumulator.concat(current.yhteystieto), [])
                  .filter((yhteystieto) => yhteystieto.yhteystietoArvo)
            : [];
        return (
            <ul>
                {yhteystiedot.map((yhteystieto, index) => (
                    <li key={index}>
                        {L(yhteystieto.yhteystietoTyyppi)} - {yhteystieto.yhteystietoArvo}
                    </li>
                ))}
            </ul>
        );
    }

    const columns = useMemo<ColumnDef<HenkiloData, HenkiloData>[]>(
        () => [
            {
                header: () => L('HENKILO_VTJ_TIETOLAHDE'),
                accessorFn: (henkilo) => L(henkilo.palvelu),
                id: 'palvelu',
                width: 150,
            },
            {
                header: () => L('HENKILO_VTJ_ETUNIMET'),
                accessorFn: (henkilo) => henkilo.etunimet,
                id: 'etunimet',
            },
            {
                header: () => L('HENKILO_VTJ_SUKUNIMI'),
                accessorFn: (henkilo) => henkilo.sukunimi,
                id: 'sukunimi',
            },
            {
                header: () => L('HENKILO_VTJ_KUTSUMANIMI'),
                accessorFn: (henkilo) => henkilo.kutsumanimi,
                id: 'kutsumanimi',
            },
            {
                header: () => L('HENKILO_VTJ_SUKUPUOLI'),
                accessorFn: (henkilo) => renderSukupuoli(henkilo),
                id: 'sukupuoli',
                width: 100,
            },
            {
                Header: L('HENKILO_VTJ_YHTEYSTIEDOT'),
                accessorFn: (henkilo) => henkilo,
                cell: ({ getValue }) => renderYhteystiedotRyhma(getValue()),
                id: 'yhteystiedot',
            },
        ],
        [henkilo]
    );

    const memoizedData = useMemo(() => {
        const renderedData = [{ ...henkilo, palvelu: 'HENKILO_VTJ_HENKILOPALVELU' }];
        if (yksilointitiedotQuery.isSuccess) {
            renderedData.push({ ...(yksilointitiedotQuery.data as Henkilo), palvelu: 'HENKILO_VTJ_VRKPALVELU' });
        }
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [henkilo, yksilointitiedotQuery.data]);

    const table = useReactTable({
        data: memoizedData ?? emptyData,
        columns: columns ?? emptyColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <OphTable table={table} isLoading={false} />;
};

export default VtjVertailuListaus;
