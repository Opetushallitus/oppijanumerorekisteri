import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, type RootState } from '../../../../store';
import { Link } from 'react-router';
import LabelValueGroup from './LabelValueGroup';
import { fetchHenkiloLinkitykset } from '../../../../actions/henkiloLinkitys.actions';
import { HenkiloLinkitysState } from '../../../../reducers/henkiloLinkitys.reducer';

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
    const dispatch = useAppDispatch();
    const linkitetyt = useSelector<RootState, HenkiloLinkitysState>((state) => state.linkitykset);
    const typeToL10nKeyMap = {
        henkiloVarmentajas: 'HENKILO_VARMENTAJA',
        henkiloVarmennettavas: 'HENKILO_VARMENNETTAVA',
    };

    useEffect(() => {
        dispatch<any>(fetchHenkiloLinkitykset(oidHenkilo));
    }, [oidHenkilo]);

    const linkitetytGroup = (varmentajas: Array<string>) => {
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

    const linkitetytByOid = linkitetyt[oidHenkilo];
    return (
        <div>
            {linkitetytByOid && linkitetytByOid[type] && !!linkitetytByOid[type].length && (
                <LabelValueGroup valueGroup={linkitetytGroup(linkitetytByOid[type])} label={typeToL10nKeyMap[type]} />
            )}
        </div>
    );
};

export default HenkiloVarmentajaSuhde;
