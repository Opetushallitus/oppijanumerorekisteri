import React, { useEffect, useId, useMemo, useState } from 'react';

import PropertySingleton from '../../../globals/PropertySingleton';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { validateEmail } from '../../../validation/EmailValidator';
import { WORK_ADDRESS, VTJ_VAKINAINEN_KOTIMAINEN_OSOITE, VTJ_SAHKOINEN_OSOITE, EMAIL } from '../../../types/constants';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { koodiLabel, useGetYhteystietotyypitQuery } from '../../../api/koodisto';
import { useAppDispatch } from '../../../store';
import { useLocalisations } from '../../../selectors';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { KayttajatiedotRead } from '../../../types/domain/kayttooikeus/KayttajatiedotRead';
import { useGetHenkiloQuery, useUpdateHenkiloMutation } from '../../../api/oppijanumerorekisteri';
import { add } from '../../../slices/toastSlice';
import Loader from '../icons/Loader';
import { OphDsInput } from '../../design-system/OphDsInput';

type OwnProps = {
    henkiloOid: string;
    isOmattiedot?: boolean;
};

const isWorkMail = (y?: YhteystietoRyhma) =>
    y?.ryhmaKuvaus === WORK_ADDRESS && !!y.yhteystieto.find((t) => t.yhteystietoTyyppi === EMAIL);
const isLastWorkEmail = (yhteystiedot: YhteystietoRyhma[], idx: number): boolean =>
    isWorkMail(yhteystiedot[idx]) && yhteystiedot.filter((y) => !!y.id && isWorkMail(y)).length < 2;
const isVirkailija = (kayttaja?: KayttajatiedotRead): boolean => kayttaja?.kayttajaTyyppi === 'VIRKAILIJA';
const isFromVTJ = (group: YhteystietoRyhma): boolean =>
    group.ryhmaAlkuperaTieto === PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VTJ;

const contactInfoTemplate: { yhteystietoTyyppi: string }[] = [
    { yhteystietoTyyppi: 'YHTEYSTIETO_KATUOSOITE' },
    { yhteystietoTyyppi: 'YHTEYSTIETO_KUNTA' },
    { yhteystietoTyyppi: 'YHTEYSTIETO_MATKAPUHELINNUMERO' },
    { yhteystietoTyyppi: 'YHTEYSTIETO_POSTINUMERO' },
    { yhteystietoTyyppi: 'YHTEYSTIETO_PUHELINNUMERO' },
    { yhteystietoTyyppi: 'YHTEYSTIETO_SAHKOPOSTI' },
];

const newYhteystiedotRyhma: YhteystietoRyhma = {
    readOnly: false,
    ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
    ryhmaKuvaus: WORK_ADDRESS,
    yhteystieto: contactInfoTemplate.map((template) => ({
        yhteystietoTyyppi: template.yhteystietoTyyppi,
        yhteystietoArvo: '',
    })),
    id: null,
};

const sortYhteystietoByTyyppi = (r: YhteystietoRyhma) => {
    const y = [...r.yhteystieto];
    y.sort((a, b) => a.yhteystietoTyyppi.localeCompare(b.yhteystietoTyyppi));
    return { ...r, yhteystieto: y };
};

const yhteystiedotRyhmaPriority = (ryhma: YhteystietoRyhma): number => {
    switch (ryhma.ryhmaKuvaus) {
        case VTJ_SAHKOINEN_OSOITE:
            return 0;
        case VTJ_VAKINAINEN_KOTIMAINEN_OSOITE:
            return 1;
        case WORK_ADDRESS:
            return 2;
        default:
            return 3;
    }
};

const sortYhteystiedotRyhma = (a: YhteystietoRyhma, b: YhteystietoRyhma): number =>
    yhteystiedotRyhmaPriority(a) - yhteystiedotRyhmaPriority(b) || (a.id ?? 0) - (b.id ?? 0);

export function HenkiloViewContactContentComponent(props: OwnProps) {
    const { data: yhteystietotyypit } = useGetYhteystietotyypitQuery();
    const dispatch = useAppDispatch();
    const { locale, L } = useLocalisations();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(props.henkiloOid);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(props.henkiloOid);
    const [putHenkilo] = useUpdateHenkiloMutation();
    const [yhteystiedot, setYhteystiedot] = useState<YhteystietoRyhma[]>([]);
    const [editing, setEditing] = useState(false);
    const sectionLabelId = useId();

    const hasHenkiloReadUpdateRights = useMemo(() => {
        return props.isOmattiedot
            ? true
            : hasAnyPalveluRooli(omattiedot?.organisaatiot, [
                  'OPPIJANUMEROREKISTERI_HENKILON_RU',
                  'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
              ]);
    }, [props.isOmattiedot, omattiedot]);

    useEffect(() => {
        if (henkilo) {
            setYhteystiedot([...henkilo.yhteystiedotRyhma].sort(sortYhteystiedotRyhma).map(sortYhteystietoByTyyppi));
        }
    }, [henkilo]);

    function removeYhteystieto(idx: number) {
        const newYhteystiedot = [...yhteystiedot];
        newYhteystiedot.splice(idx, 1);
        setYhteystiedot(newYhteystiedot);
    }

    function discard() {
        if (henkilo) {
            setYhteystiedot([...henkilo.yhteystiedotRyhma].sort(sortYhteystiedotRyhma).map(sortYhteystietoByTyyppi));
        }
        setEditing(false);
    }

    async function update() {
        putHenkilo({ ...henkilo, yhteystiedotRyhma: yhteystiedot })
            .unwrap()
            .then(() => {
                setEditing(false);
                dispatch(
                    add({
                        id: `henkilo-update-ok-${Math.random()}`,
                        type: 'ok',
                        header: L('HENKILO_YHTEYSTIEDOT_OTSIKKO'),
                    })
                );
            })
            .catch(() =>
                dispatch(
                    add({
                        id: `henkilo-update-failed-${Math.random()}`,
                        type: 'error',
                        header: L('NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'),
                    })
                )
            );
    }

    const isValid = useMemo(() => {
        return !yhteystiedot.some((r) =>
            r.yhteystieto.some(
                (r) => r.yhteystietoTyyppi === EMAIL && r.yhteystietoArvo && !validateEmail(r.yhteystietoArvo)
            )
        );
    }, [yhteystiedot]);

    const isDefaultWorkAddress = (yhteystieto: YhteystietoRyhma) =>
        yhteystieto.ryhmaKuvaus === WORK_ADDRESS &&
        yhteystieto.id ===
            Math.max(...yhteystiedot.filter((y) => y.ryhmaKuvaus === WORK_ADDRESS).map((y) => y.id ?? 0));

    const mapYhteystietoArvo = (ryhma: YhteystietoRyhma, value: string, yhteystietoIdx: number) => {
        const yhteystieto = ryhma.yhteystieto.map((y, i) =>
            i === yhteystietoIdx ? { ...y, yhteystietoArvo: value } : y
        );
        return { ...ryhma, yhteystieto };
    };

    const mapYhteystietoRyhmaArvo = (value: string, yhteystiedotryhmaIdx: number, yhteystietoIdx: number) => {
        return yhteystiedot.map((r, i) =>
            i === yhteystiedotryhmaIdx ? mapYhteystietoArvo(r, value, yhteystietoIdx) : r
        );
    };

    const renderYhteystieto = (ryhma: YhteystietoRyhma, idx: number) => {
        return (
            <div className="oph-ds-card-light" key={`${ryhma.id}-${idx}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>
                        {koodiLabel(
                            yhteystietotyypit?.find((t) => t.koodiArvo === ryhma.ryhmaKuvaus),
                            locale
                        )}
                        {isDefaultWorkAddress(ryhma) ? ' *' : ''}
                    </h3>
                    {editing && !isFromVTJ(ryhma) && !isLastWorkEmail(yhteystiedot, idx) ? (
                        <button
                            className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                            title={L('POISTA')}
                            onClick={() => removeYhteystieto(idx)}
                        />
                    ) : null}
                </div>
                {ryhma.yhteystieto.map((y, idx2) => (
                    <div key={idx2}>
                        {editing && !isFromVTJ(ryhma) ? (
                            <OphDsInput
                                id={`${y.yhteystietoTyyppi}-${idx}`}
                                label={L(y.yhteystietoTyyppi)}
                                defaultValue={y.yhteystietoArvo}
                                error={
                                    y.yhteystietoTyyppi === EMAIL &&
                                    y.yhteystietoArvo &&
                                    !validateEmail(y.yhteystietoArvo)
                                        ? L('VIRKAILIJAN_LISAYS_SAHKOPOSTI_VIRHEELLINEN')
                                        : undefined
                                }
                                onChange={(y) => setYhteystiedot(mapYhteystietoRyhmaArvo(y, idx, idx2))}
                            />
                        ) : (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '25px',
                                }}
                                className="labelValue"
                            >
                                <span className="oph-bold">{L(y.yhteystietoTyyppi)}</span>
                                <span>{y.yhteystietoArvo}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (isHenkiloLoading) {
        return <Loader />;
    }
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L('HENKILO_YHTEYSTIEDOT_OTSIKKO')}</h2>
            {henkilo?.turvakielto ? <h3>{L('YHTEYSTIETO_TURVAKIELTO')}</h3> : null}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {yhteystiedot
                    .filter((c) => omattiedot?.isAdmin || !isVirkailija(kayttajatiedot) || !isFromVTJ(c))
                    .map((ryhma, idx) => renderYhteystieto(ryhma, idx))}
            </div>
            <div>
                {!editing && hasHenkiloReadUpdateRights && (
                    <button
                        className="oph-ds-button"
                        disabled={henkilo?.passivoitu || henkilo?.duplicate}
                        onClick={() => setEditing(true)}
                    >
                        {L('MUOKKAA_LINKKI')}
                    </button>
                )}
                {editing && (
                    <div>
                        <button
                            className="oph-ds-button oph-ds-button-icon oph-ds-button-icon-plus"
                            style={{ marginRight: '1rem' }}
                            onClick={() => setYhteystiedot([...yhteystiedot, { ...newYhteystiedotRyhma }])}
                        >
                            {L('HENKILO_LUOYHTEYSTIETO')}
                        </button>
                        <button
                            className="oph-ds-button"
                            style={{ marginRight: '1rem' }}
                            disabled={!isValid}
                            onClick={update}
                        >
                            {L('TALLENNA_LINKKI')}
                        </button>
                        <button className="oph-ds-button oph-ds-button-bordered" onClick={discard}>
                            {L('PERUUTA_LINKKI')}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default HenkiloViewContactContentComponent;
