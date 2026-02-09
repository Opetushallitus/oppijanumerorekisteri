import React from 'react';
import { NavLink } from 'react-router';
import { useLocalisations } from '../../selectors';
import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useGetYksilointitiedotQuery,
} from '../../api/oppijanumerorekisteri';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { enabledDuplikaattiView, enabledVtjVertailuView, vtjDataAvailable } from '../navigation/NavigationTabs';
import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';

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

    if (!isDuplicateViewEnabled && !isVtjVertailuEnabled) {
        return;
    }

    return (
        <>
            <NavLink className={({ isActive }) => (isActive ? 'active' : 'inactive')} to={`/oppija2/${oid}`} end>
                {'Oppijan tiedot'}
            </NavLink>
            {isDuplicateViewEnabled ? (
                <NavLink
                    className={({ isActive }) => (isActive ? 'active' : 'inactive')}
                    to={`/oppija2/${oid}/duplikaatit`}
                    end
                >
                    {L['NAVI_HAE_DUPLIKAATIT']}
                </NavLink>
            ) : (
                <button disabled>{L['NAVI_HAE_DUPLIKAATIT']}</button>
            )}
            {isVtjVertailuEnabled ? (
                <NavLink
                    className={({ isActive }) => (isActive ? 'active' : 'inactive')}
                    to={`/oppija2/${oid}/vtjvertailu`}
                    end
                >
                    {L['NAVI_VTJ_VERTAILU']}
                </NavLink>
            ) : (
                <button disabled>{L['NAVI_VTJ_VERTAILU']}</button>
            )}
        </>
    );
};
