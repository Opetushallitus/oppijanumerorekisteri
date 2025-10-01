import React, { useMemo } from 'react';
import { Link } from 'react-router';

import { useAppDispatch } from '../../../../store';
import { fetchHenkilo } from '../../../../actions/henkilo.actions';
import TextButton from '../../button/TextButton';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { FieldlessLabelValue } from './FieldlessLabelValue';
import { useLocalisations } from '../../../../selectors';
import { useGetHenkiloMasterQuery, useUnlinkHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { useGetOmattiedotQuery } from '../../../../api/kayttooikeus';

type OwnProps = {
    oidHenkilo: string;
    oppija?: boolean;
};

const MasterHenkilo = ({ oidHenkilo, oppija }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: master, isFetching } = useGetHenkiloMasterQuery(oidHenkilo);
    const [unlinkHenkilo] = useUnlinkHenkiloMutation();

    function getLinkHref(oid: string) {
        const url = oppija ? 'oppija' : 'virkailija';
        return `/${url}/${oid}`;
    }

    async function removeLink(masterOid: string, slaveOid: string) {
        await unlinkHenkilo({ masterOid, slaveOid })
            .unwrap()
            .then(() => {
                dispatch<any>(fetchHenkilo(oidHenkilo));
            });
    }

    const hasPermission = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'HENKILONHALLINTA_OPHREKISTERI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
    }, [omattiedot]);
    const renderLinkitetyt = !isFetching && master.oidHenkilo && oidHenkilo !== master.oidHenkilo;

    return renderLinkitetyt ? (
        <FieldlessLabelValue label="HENKILO_LINKITETYT_MASTER" readOnly>
            <div className="nowrap">
                <Link to={getLinkHref(master.oidHenkilo)}>{master.kutsumanimi + ' ' + master.sukunimi}</Link>
                {hasPermission && (
                    <span>
                        <span> | </span>
                        <TextButton action={removeLink.bind(this, master.oidHenkilo, oidHenkilo)}>
                            {L['HENKILO_POISTA_LINKITYS']}
                        </TextButton>
                    </span>
                )}
            </div>
        </FieldlessLabelValue>
    ) : null;
};

export default MasterHenkilo;
