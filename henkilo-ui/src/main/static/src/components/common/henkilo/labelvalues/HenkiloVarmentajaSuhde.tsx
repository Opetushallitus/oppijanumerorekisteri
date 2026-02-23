import React from 'react';
import { Link } from 'react-router';

import LabelValueGroup from './LabelValueGroup';
import { useGetHenkiloLinkityksetQuery } from '../../../../api/kayttooikeus';

type OwnProps = {
    oidHenkilo: string;
    type: 'henkiloVarmentajas' | 'henkiloVarmennettavas';
};

/**
 * Hakee ja näyttää henkilön varmentajasuhteen LabelValueGroup:ina. Näitä suhteita on vain virkailijoilla joten linkki
 * olettaa /virkailija polun.
 */
const HenkiloVarmentajaSuhde = (props: OwnProps) => {
    const { oidHenkilo, type } = props;
    const { data: linkitykset } = useGetHenkiloLinkityksetQuery(oidHenkilo);
    const typeToL10nKeyMap = {
        henkiloVarmentajas: 'HENKILO_VARMENTAJA',
        henkiloVarmennettavas: 'HENKILO_VARMENNETTAVA',
    };

    const linkitetytGroup = (varmentajas: string[]) => {
        return (
            <>
                {varmentajas.map((varmentajaOid, index) => (
                    <div key={index} className="nowrap">
                        <Link to={`/virkailija/${varmentajaOid}`}>{varmentajaOid}</Link>
                    </div>
                ))}
            </>
        );
    };

    return (
        <div>
            {linkitykset && linkitykset[type] && !!linkitykset[type].length && (
                <LabelValueGroup valueGroup={linkitetytGroup(linkitykset[type])} label={typeToL10nKeyMap[type]} />
            )}
        </div>
    );
};

export default HenkiloVarmentajaSuhde;
