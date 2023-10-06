import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

import './VtjVertailuListaus.css';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';

type Props = {
    L: Record<string, string>;
    henkilo: HenkiloState;
};

type HenkiloData = {
    etunimet?: string;
    sukunimi?: string;
    kutsumanimi?: string;
    sukupuoli?: string;
    yhteystiedotRyhma?: YhteystietoRyhma[];
    palvelu: string;
};

const VtjVertailuListaus = ({ henkilo }: Props) => {
    const { L } = useLocalisations();

    function renderSukupuoli(henkilo: HenkiloData) {
        if (henkilo.sukupuoli === '1') {
            return L['HENKILO_VTJ_SUKUPUOLI_MIES'];
        } else if (henkilo.sukupuoli === '2') {
            return L['HENKILO_VTJ_SUKUPUOLI_NAINEN'];
        } else {
            return '';
        }
    }

    function renderYhteystiedotRyhma(henkilo: HenkiloData) {
        const yhteystiedot = henkilo.yhteystiedotRyhma
            ? henkilo.yhteystiedotRyhma
                  .reduce((accumulator, current) => accumulator.concat(current.yhteystieto), [])
                  .filter((yhteystieto) => yhteystieto.yhteystietoArvo)
            : [];
        return (
            <ul>
                {yhteystiedot.map((yhteystieto, index) => (
                    <li key={index}>
                        {L[yhteystieto.yhteystietoTyyppi]} - {yhteystieto.yhteystietoArvo}
                    </li>
                ))}
            </ul>
        );
    }

    const columns = useMemo<ColumnDef<HenkiloData, HenkiloData>[]>(
        () => [
            {
                header: () => L['HENKILO_VTJ_TIETOLAHDE'],
                accessorFn: (henkilo) => L[henkilo.palvelu],
                id: 'palvelu',
                width: 150,
            },
            {
                header: () => L['HENKILO_VTJ_ETUNIMET'],
                accessorFn: (henkilo) => henkilo.etunimet,
                id: 'etunimet',
            },
            {
                header: () => L['HENKILO_VTJ_SUKUNIMI'],
                accessorFn: (henkilo) => henkilo.sukunimi,
                id: 'sukunimi',
            },
            {
                header: () => L['HENKILO_VTJ_KUTSUMANIMI'],
                accessorFn: (henkilo) => henkilo.kutsumanimi,
                id: 'kutsumanimi',
            },
            {
                header: () => L['HENKILO_VTJ_SUKUPUOLI'],
                accessorFn: (henkilo) => renderSukupuoli(henkilo),
                id: 'sukupuoli',
                width: 100,
            },
            {
                Header: L['HENKILO_VTJ_YHTEYSTIEDOT'],
                accessorFn: (henkilo) => henkilo,
                cell: ({ getValue }) => renderYhteystiedotRyhma(getValue()),
                id: 'yhteystiedot',
            },
        ],
        [henkilo]
    );

    const table = useReactTable({
        data: [
            { ...henkilo?.henkilo, palvelu: 'HENKILO_VTJ_HENKILOPALVELU' },
            { ...henkilo?.yksilointitiedot, palvelu: 'HENKILO_VTJ_VRKPALVELU' },
        ],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <OphTable table={table} isLoading={false} />;
};

export default VtjVertailuListaus;
