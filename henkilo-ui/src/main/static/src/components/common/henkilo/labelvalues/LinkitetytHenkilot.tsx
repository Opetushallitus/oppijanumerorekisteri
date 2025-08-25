import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { useAppDispatch, type RootState } from '../../../../store';
import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import HenkiloVarmentajaSuhde from './HenkiloVarmentajaSuhde';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import { useLocalisations } from '../../../../selectors';
import { useGetHenkiloSlavesQuery, useUnlinkHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { fetchHenkilo } from '../../../../actions/henkilo.actions';

type OwnProps = {
    oppija?: boolean;
};

/**
 * Henkilön linkitykset (duplikaattislave- ja varmentaja-suhteet)
 */
const LinkitetytHenkilot = ({ oppija }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const { data: slaves } = useGetHenkiloSlavesQuery(henkilo.henkilo.oidHenkilo);
    const [unlinkHenkilo] = useUnlinkHenkiloMutation();

    function valueGroup() {
        const hasPermission = hasAnyPalveluRooli(omattiedot.organisaatiot, [
            'HENKILONHALLINTA_OPHREKISTERI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
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
                                <TextButton action={() => removeLink(henkilo.henkilo.oidHenkilo, slave.oidHenkilo)}>
                                    {L['HENKILO_POISTA_LINKITYS']}
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

    async function removeLink(masterOid: string, slaveOid: string) {
        await unlinkHenkilo({ masterOid, slaveOid })
            .unwrap()
            .then(() => {
                dispatch<any>(fetchHenkilo(henkilo.henkilo.oidHenkilo));
            });
    }

    return (
        <div>
            <React.Fragment>
                {!!slaves?.length && <LabelValueGroup valueGroup={valueGroup()} label={'HENKILO_LINKITETYT'} />}
            </React.Fragment>
            <HenkiloVarmentajaSuhde oidHenkilo={henkilo.henkilo.oidHenkilo} type="henkiloVarmentajas" />
            <HenkiloVarmentajaSuhde oidHenkilo={henkilo.henkilo.oidHenkilo} type="henkiloVarmennettavas" />
        </div>
    );
};

export default LinkitetytHenkilot;
