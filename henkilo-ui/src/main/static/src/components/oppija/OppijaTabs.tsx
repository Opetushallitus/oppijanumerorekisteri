import React from 'react';
import { NavLink } from 'react-router';

import { useLocalisations } from '../../selectors';
import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useGetYksilointitiedotQuery,
} from '../../api/oppijanumerorekisteri';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Yksilointitieto } from '../../types/domain/oppijanumerorekisteri/yksilointitieto.types';

export const enabledDuplikaattiView = (oidHenkilo: string | null | undefined, masterHenkiloOid?: string): boolean =>
    masterHenkiloOid === undefined || masterHenkiloOid === oidHenkilo;

export const enabledVtjVertailuView = (henkilo?: Henkilo): boolean =>
    !!henkilo?.yksilointiYritetty && !henkilo?.yksiloityVTJ && !henkilo?.duplicate;

export const vtjDataAvailable = (yksilointitieto: Yksilointitieto | null | undefined): boolean =>
    !!yksilointitieto?.etunimet ||
    !!yksilointitieto?.sukunimi ||
    !!yksilointitieto?.kutsumanimi ||
    !!yksilointitieto?.yhteystiedot ||
    !!yksilointitieto?.sukupuoli;

type OppijaTabsProps = {
    oid: string;
};

export const OppijaTabs = ({ oid }: OppijaTabsProps) => {
    const { L } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(oid);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { data: yksilointitiedot } = useGetYksilointitiedotQuery(oid);

    const roolit = parsePalveluRoolit(omattiedot?.organisaatiot) ?? [];
    const isDuplicateViewEnabled =
        (omattiedot?.isAdmin ||
            ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'].some((r) =>
                roolit.includes(r)
            )) &&
        enabledDuplikaattiView(oid, master?.oidHenkilo);
    const isVtjVertailuEnabled =
        (omattiedot?.isAdmin ||
            ['OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'].some((r) =>
                roolit.includes(r)
            )) &&
        enabledVtjVertailuView(henkilo) &&
        vtjDataAvailable(yksilointitiedot);

    return (
        <>
            <NavLink className={({ isActive }) => (isActive ? 'active' : 'inactive')} to={`/oppija/${oid}`} end>
                {L('OPPIJAN_TIEDOT')}
            </NavLink>
            {isDuplicateViewEnabled ? (
                <NavLink
                    className={({ isActive }) => (isActive ? 'active' : 'inactive')}
                    to={`/oppija/${oid}/duplikaatit`}
                    end
                >
                    {L('NAVI_HAE_DUPLIKAATIT')}
                </NavLink>
            ) : (
                <button disabled>{L('NAVI_HAE_DUPLIKAATIT')}</button>
            )}
            {isVtjVertailuEnabled ? (
                <NavLink
                    className={({ isActive }) => (isActive ? 'active' : 'inactive')}
                    to={`/oppija/${oid}/vtjvertailu`}
                    end
                >
                    {L('NAVI_VTJ_VERTAILU')}
                </NavLink>
            ) : (
                <button disabled>{L('NAVI_VTJ_VERTAILU')}</button>
            )}
        </>
    );
};
