import React, { SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../../store';
import AbstractUserContent from './AbstractUserContent';
import Sukunimi from '../labelvalues/Sukunimi';
import EditButton from '../buttons/EditButton';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import Loader from '../../icons/Loader';
import Oid from '../labelvalues/Oid';
import Kayttajanimi from '../labelvalues/Kayttajanimi';
import PasswordButton from '../buttons/PasswordButton';
import PassivoiButton from '../buttons/PassivoiButton';
import AktivoiButton from '../buttons/AktivoiButton';
import PoistaKayttajatunnusButton from '../buttons/PoistaKayttajatunnusButton';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../../api/kayttooikeus';

type OwnProps = {
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
    updateModelAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    updateDateAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    edit: () => void;
    henkiloUpdate: Henkilo;
    oidHenkilo: string;
    isValidForm: boolean;
};

const PalveluUserContent = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(props.oidHenkilo);

    const createBasicInfo = () => {
        return [
            [<Sukunimi key="palveluuser-sukunimi" autofocus={true} label="HENKILO_PALVELUN_NIMI" {...props} />],
            [
                <Oid
                    key="palveluuser-oid"
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
                <Kayttajanimi
                    key="palveluuser-kayttajanimi"
                    kayttajatiedot={kayttajatiedot}
                    disabled={!omattiedot?.isAdmin && !!kayttajatiedot?.username}
                    readOnly={props.readOnly}
                    updateModelFieldAction={props.updateModelAction}
                />,
            ],
        ];
    };

    // Basic info default buttons
    const createReadOnlyButtons = () => {
        const duplicate = henkilo.henkilo.duplicate;
        const passivoitu = henkilo.henkilo.passivoitu;
        const kayttajatunnukseton = !kayttajatiedot?.username;
        return [
            <EditButton key="editbutton" editAction={props.edit} disabled={duplicate || passivoitu} />,
            omattiedot?.isAdmin ? <PassivoiButton disabled={duplicate || passivoitu} /> : null,
            omattiedot?.isAdmin && henkilo.henkilo.passivoitu ? (
                <AktivoiButton oidHenkilo={henkilo.henkilo.oidHenkilo} />
            ) : null,
            !kayttajatunnukseton && omattiedot.isAdmin ? (
                <PoistaKayttajatunnusButton henkiloOid={henkilo.henkilo.oidHenkilo} />
            ) : null,
            <PasswordButton
                key="passwordbutton"
                oidHenkilo={props.oidHenkilo}
                styles={{ top: '3rem', left: '0', width: '18rem' }}
                disabled={duplicate || passivoitu || kayttajatunnukseton}
            />,
        ];
    };

    return henkilo.henkiloLoading ? (
        <Loader />
    ) : (
        <AbstractUserContent
            readOnly={props.readOnly}
            discardAction={props.discardAction}
            updateAction={props.updateAction}
            basicInfo={createBasicInfo()}
            readOnlyButtons={createReadOnlyButtons()}
            isValidForm={props.isValidForm}
        />
    );
};

export default PalveluUserContent;
