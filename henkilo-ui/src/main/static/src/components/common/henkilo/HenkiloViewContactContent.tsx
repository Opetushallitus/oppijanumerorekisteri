import React, { useEffect, useId, useMemo, useState } from 'react';

import Button from '../button/Button';
import PropertySingleton from '../../../globals/PropertySingleton';
import AddIcon from '../icons/AddIcon';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { validateEmail } from '../../../validation/EmailValidator';
import { WORK_ADDRESS, View, EMAIL } from '../../../types/constants';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { koodiLabel, useGetYhteystietotyypitQuery } from '../../../api/koodisto';
import { useAppDispatch } from '../../../store';
import { useLocalisations } from '../../../selectors';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { KayttajatiedotRead } from '../../../types/domain/kayttooikeus/KayttajatiedotRead';
import { useGetHenkiloQuery, useUpdateHenkiloMutation } from '../../../api/oppijanumerorekisteri';
import { add } from '../../../slices/toastSlice';
import Loader from '../icons/Loader';

import './HenkiloViewContactContent.css';

type OwnProps = {
    readOnly: boolean;
    henkiloOid: string;
    view: View;
};

const isLastWorkEmail = (yhteystiedot: YhteystietoRyhma[]): boolean =>
    yhteystiedot.filter(
        (y) => !!y.id && y.ryhmaKuvaus === WORK_ADDRESS && !!y.yhteystieto.find((t) => t.yhteystietoTyyppi === EMAIL)
    ).length < 2;
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

export function HenkiloViewContactContentComponent(props: OwnProps) {
    const { data: yhteystietotyypit } = useGetYhteystietotyypitQuery();
    const dispatch = useAppDispatch();
    const { locale, L } = useLocalisations();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(props.henkiloOid);
    const [putHenkilo] = useUpdateHenkiloMutation();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(props.henkiloOid);
    const [yhteystiedot, setYhteystiedot] = useState<YhteystietoRyhma[]>([]);
    const [errors, setErrors] = useState(false);
    const [editing, setEditing] = useState(false);
    const sectionLabelId = useId();

    const hasHenkiloReadUpdateRights = useMemo(() => {
        return props.view === 'omattiedot'
            ? true
            : hasAnyPalveluRooli(omattiedot?.organisaatiot, [
                  'OPPIJANUMEROREKISTERI_HENKILON_RU',
                  'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
              ]);
    }, [props.view, omattiedot]);

    useEffect(() => {
        if (henkilo) {
            setYhteystiedot(henkilo.yhteystiedotRyhma.map(sortYhteystietoByTyyppi));
        }
    }, [henkilo]);

    function removeYhteystieto(idx: number) {
        const newYhteystiedot = [...yhteystiedot];
        newYhteystiedot.splice(idx, 1);
        setYhteystiedot(newYhteystiedot);
    }

    function discard() {
        if (henkilo) {
            setYhteystiedot(henkilo.yhteystiedotRyhma.map(sortYhteystietoByTyyppi));
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
                        header: L['HENKILO_YHTEYSTIEDOT_OTSIKKO'],
                    })
                );
            })
            .catch(() =>
                dispatch(
                    add({
                        id: `henkilo-update-failed-${Math.random()}`,
                        type: 'error',
                        header: L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'],
                    })
                )
            );
    }

    function createYhteystiedotRyhma() {
        setYhteystiedot([...yhteystiedot, { ...newYhteystiedotRyhma }]);
    }

    const isDefaultWorkAddress = (yhteystieto: YhteystietoRyhma) =>
        yhteystieto.ryhmaKuvaus === WORK_ADDRESS &&
        yhteystieto.id ===
            Math.max(...yhteystiedot.filter((y) => y.ryhmaKuvaus === WORK_ADDRESS).map((y) => y.id ?? 0));

    const validateAndMapYhteystietoArvo = (ryhma: YhteystietoRyhma, value: string, yhteystietoIdx: number) => {
        if (ryhma.yhteystieto[yhteystietoIdx]?.yhteystietoTyyppi === EMAIL && value) {
            setErrors(!validateEmail(value));
        }
        const yhteystieto = ryhma.yhteystieto.map((y, i) =>
            i === yhteystietoIdx ? { ...y, yhteystietoArvo: value } : y
        );
        return { ...ryhma, yhteystieto };
    };

    const mapYhteystietoRyhmaArvo = (value: string, yhteystiedotryhmaIdx: number, yhteystietoIdx: number) => {
        return yhteystiedot.map((r, i) =>
            i === yhteystiedotryhmaIdx ? validateAndMapYhteystietoArvo(r, value, yhteystietoIdx) : r
        );
    };

    const renderYhteystieto = (ryhma: YhteystietoRyhma, idx: number) => {
        return (
            <>
                <div>
                    <span className="oph-h3 oph-bold midHeader">
                        {koodiLabel(
                            yhteystietotyypit?.find((t) => t.koodiArvo === ryhma.ryhmaKuvaus),
                            locale
                        )}
                        {isDefaultWorkAddress(ryhma) ? ' *' : ''}
                    </span>
                    {editing && !isFromVTJ(ryhma) && !isLastWorkEmail(yhteystiedot) ? (
                        <span className="float-right">
                            <IconButton onClick={() => removeYhteystieto(idx)}>
                                <CrossIcon />
                            </IconButton>
                        </span>
                    ) : null}
                </div>
                {ryhma.yhteystieto.map((y, idx2) => (
                    <div key={idx2}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '25px',
                            }}
                            className="labelValue"
                        >
                            <span className="oph-bold">{L[y.yhteystietoTyyppi]}</span>
                            {editing && !isFromVTJ(ryhma) ? (
                                <input
                                    className="oph-input"
                                    defaultValue={y.yhteystietoArvo}
                                    onChange={(e) =>
                                        setYhteystiedot(mapYhteystietoRyhmaArvo(e.target.value, idx, idx2))
                                    }
                                />
                            ) : (
                                y.yhteystietoArvo
                            )}
                        </div>
                    </div>
                ))}
            </>
        );
    };

    if (isHenkiloLoading) {
        return <Loader />;
    }
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper contact-content">
            <div>
                <h2 id={sectionLabelId}>{L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</h2>
                {henkilo?.turvakielto ? (
                    <div className="oph-h3 oph-bold midHeader">{L['YHTEYSTIETO_TURVAKIELTO']}</div>
                ) : null}

                <div className="henkiloViewContent">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        {yhteystiedot
                            .filter((c) => omattiedot?.isAdmin || !isVirkailija(kayttajatiedot) || !isFromVTJ(c))
                            .map((ryhma, idx) => (
                                <div key={idx}>{renderYhteystieto(ryhma, idx)}</div>
                            ))}
                    </div>
                </div>
            </div>
            <div className="contactContentButtons">
                {!editing && hasHenkiloReadUpdateRights && (
                    <Button
                        disabled={henkilo?.passivoitu || henkilo?.duplicate}
                        key="contactEdit"
                        action={() => setEditing(true)}
                    >
                        {L['MUOKKAA_LINKKI']}
                    </Button>
                )}
                {editing && (
                    <>
                        <button
                            className="oph-button oph-button-primary edit-button-update-button"
                            onClick={() => createYhteystiedotRyhma()}
                        >
                            <AddIcon /> {L['HENKILO_LUOYHTEYSTIETO']}
                        </button>
                        <Button className="edit-button-update-button" disabled={errors} action={update}>
                            {L['TALLENNA_LINKKI']}
                        </Button>
                        <Button className="edit-button-discard-button" cancel action={discard}>
                            {L['PERUUTA_LINKKI']}
                        </Button>
                    </>
                )}
            </div>
        </section>
    );
}

export default HenkiloViewContactContentComponent;
