import React, { useMemo } from 'react';
import { Link } from 'react-router';

import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import HenkiloVarmentajaSuhde from './HenkiloVarmentajaSuhde';
import { useLocalisations } from '../../../../selectors';
import { useGetHenkiloSlavesQuery, useUnlinkHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { useGetOmattiedotQuery } from '../../../../api/kayttooikeus';

type OwnProps = {
    henkiloOid: string;
    oppija?: boolean;
};

/**
 * Henkilön linkitykset (duplikaattislave- ja varmentaja-suhteet)
 */
const LinkitetytHenkilot = ({ henkiloOid, oppija }: OwnProps) => {
    const { L } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: slaves } = useGetHenkiloSlavesQuery(henkiloOid);
    const [unlinkHenkilo] = useUnlinkHenkiloMutation();

    const hasPermission = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'HENKILONHALLINTA_OPHREKISTERI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
    }, [omattiedot]);

    function valueGroup() {
        return (
            <div>
                {slaves?.map((slave, index) => (
                    <div key={index} className="nowrap">
                        <Link to={getLinkHref(slave.oidHenkilo)}>
                            {slave.kutsumanimi} {slave.sukunimi}
                        </Link>
                        {hasPermission && (
                            <span>
                                <span> | </span>
                                <TextButton
                                    action={() => unlinkHenkilo({ masterOid: henkiloOid, slaveOid: slave.oidHenkilo })}
                                >
                                    {L('HENKILO_POISTA_LINKITYS')}
                                </TextButton>
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    function getLinkHref(oid: string) {
        const url = oppija ? 'oppija' : 'virkailija';
        return `/${url}/${oid}`;
    }

    return (
        <div>
            <React.Fragment>
                {!!slaves?.length && <LabelValueGroup valueGroup={valueGroup()} label={'HENKILO_LINKITETYT'} />}
            </React.Fragment>
            <HenkiloVarmentajaSuhde oidHenkilo={henkiloOid} type="henkiloVarmentajas" />
            <HenkiloVarmentajaSuhde oidHenkilo={henkiloOid} type="henkiloVarmennettavas" />
        </div>
    );
};

export default LinkitetytHenkilot;
