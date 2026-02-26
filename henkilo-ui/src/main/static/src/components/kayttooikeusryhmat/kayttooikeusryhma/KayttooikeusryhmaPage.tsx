import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { SingleValue } from 'react-select';
import { format, parseISO } from 'date-fns';

import './KayttooikeusryhmaPage.css';
import KayttooikeusryhmanOrganisaatiorajoite from './KayttooikeusryhmanOrganisaatiorajoite';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';
import MyonnettavatKayttooikeusryhmat from './MyonnettavatKayttooikeusryhmat';
import KayttooikeusryhmatPalvelutJaKayttooikeudet from './KayttooikeusryhmatPalvelutJaKayttooikeudet';
import { TextGroupModify } from '../../../types/domain/kayttooikeus/textgroup.types';
import { PalveluRooliModify } from '../../../types/domain/kayttooikeus/PalveluRooliModify.types';
import { Text } from '../../../types/domain/kayttooikeus/text.types';
import { SpinnerInButton } from '../../common/icons/SpinnerInButton';
import { LocalNotification } from '../../common/Notification/LocalNotification';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { getLocalization } from '../../../utilities/localisation.util';
import KayttooikeusryhmatSallittuKayttajatyyppi from './KayttooikeusryhmatSallittuKayttajatyyppi';
import ToggleKayttooikeusryhmaStateModal from './ToggleKayttooikeusryhmaStateModal';
import { OrganisaatioViite } from '../../../types/domain/kayttooikeus/organisaatioviite.types';
import { SelectOption } from '../../../utilities/select';
import { useLocalisations } from '../../../selectors';
import {
    KayttooikeusryhmaRequest,
    useGetKayttooikeusryhmaMyontoviiteQuery,
    useGetKayttooikeusryhmaQuery,
    useGetKayttooikeusryhmaRoolisQuery,
    useGetOrganisationsQuery,
    usePostKayttooikeusryhmaMutation,
    usePutKayttooikeusryhmaMutation,
} from '../../../api/kayttooikeus';
import { useAppDispatch } from '../../../store';
import { useGetOppilaitostyypitQuery, useGetOrganisaatiotyypitQuery } from '../../../api/koodisto';
import { add } from '../../../slices/toastSlice';

type Locales = 'FI' | 'SV' | 'EN';

export type LocalizableField = Record<Locales, string>;

export type PalveluJaKayttooikeusSelection = {
    palvelu: SingleValue<SelectOption>;
    kayttooikeus: SingleValue<SelectOption>;
};

export type SallitutKayttajatyypit = 'PALVELU' | 'VIRKAILIJA';

export type KayttooikeusryhmaForm = {
    name: LocalizableField;
    description: LocalizableField;
    ryhmaRestriction: boolean;
    organisaatioSelections: OrganisaatioSelectObject[];
    oppilaitostyypitSelections: string[];
    organisaatiotyypitSelections: string[];
    kayttooikeusryhmaSelections: SelectOption[];
    palveluJaKayttooikeusSelections: PalveluJaKayttooikeusSelection[];
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null;
};

const initialKayttooikeusryhmaForm: KayttooikeusryhmaForm = {
    name: { FI: '', SV: '', EN: '' },
    description: { FI: '', SV: '', EN: '' },
    organisaatioSelections: [],
    oppilaitostyypitSelections: [],
    organisaatiotyypitSelections: [],
    ryhmaRestriction: false,
    kayttooikeusryhmaSelections: [],
    palveluJaKayttooikeusSelections: [],
    sallittuKayttajatyyppi: null,
};

export const KayttooikeusryhmaPage = (props: { kayttooikeusryhmaId: string }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { L, locale } = useLocalisations();
    const { data: oppilaitostyyppiKoodisto } = useGetOppilaitostyypitQuery();
    const { data: organisaatiotyyppiKoodisto } = useGetOrganisaatiotyypitQuery();
    const { data: kayttooikeusryhma } = useGetKayttooikeusryhmaQuery(props.kayttooikeusryhmaId, {
        skip: !props.kayttooikeusryhmaId,
    });
    const { data: kayttooikeusryhmaMyontoviite } = useGetKayttooikeusryhmaMyontoviiteQuery(props.kayttooikeusryhmaId, {
        skip: !props.kayttooikeusryhmaId,
    });
    const { data: organisations } = useGetOrganisationsQuery();
    const { data: palvelutRoolit } = useGetKayttooikeusryhmaRoolisQuery(props.kayttooikeusryhmaId, {
        skip: !props.kayttooikeusryhmaId,
    });
    const [postKayttooikeusryhma] = usePostKayttooikeusryhmaMutation();
    const [putKayttooikeusryhma] = usePutKayttooikeusryhmaMutation();
    const [kayttooikeusryhmaForm, setKayttooikeusryhmaForm] =
        useState<KayttooikeusryhmaForm>(initialKayttooikeusryhmaForm);
    const [palvelutSelection, setPalvelutSelection] = useState<SingleValue<SelectOption>>(null);
    const [palveluKayttooikeusSelection, setPalveluKayttooikeusSelection] = useState<SingleValue<SelectOption>>(null);
    const [isPassivoitu, setIsPassivoitu] = useState(false);
    const [ryhmaRestrictionViite, setRyhmaRestrictionViite] = useState<OrganisaatioViite>();
    const [toggleTallenna, setToggleTallenna] = useState(false);

    useEffect(() => {
        if (props.kayttooikeusryhmaId && palvelutRoolit) {
            const newKayttooikeusryhmaForm = _parseExistingKayttooikeusryhmaData();
            const organisaatioSelections = _parseExistingOrganisaatioData();
            const organisaatioViitteet = kayttooikeusryhma?.organisaatioViite || [];
            const newRyhmaRestrictionViite = organisaatioViitteet.find((viite) =>
                _isRyhmaOid(viite.organisaatioTyyppi)
            );
            setKayttooikeusryhmaForm({ ...newKayttooikeusryhmaForm, organisaatioSelections });
            setRyhmaRestrictionViite(newRyhmaRestrictionViite);
            setIsPassivoitu(!!kayttooikeusryhma?.passivoitu);
        }
    }, [props.kayttooikeusryhmaId, kayttooikeusryhma, kayttooikeusryhmaMyontoviite, palvelutRoolit, organisations]);

    const _parseExistingKayttooikeusryhmaData = (): KayttooikeusryhmaForm => {
        return {
            name: _parseExistingTextsData(kayttooikeusryhma?.nimi?.texts),
            description: _parseExistingTextsData(kayttooikeusryhma?.kuvaus?.texts),
            organisaatioSelections: _parseExistingOrganisaatioData(),
            oppilaitostyypitSelections: _parseExistingOppilaitostyyppiData(),
            organisaatiotyypitSelections: _parseExistingOrganisaatiotyyppiData(),
            ryhmaRestriction: _parseExistingRyhmaRestriction(),
            kayttooikeusryhmaSelections: _parseExistingKayttooikeusryhmaSelections(),
            palveluJaKayttooikeusSelections: _parseExistingPalvelutRoolitData(),
            sallittuKayttajatyyppi: kayttooikeusryhma?.sallittuKayttajatyyppi ?? null,
        };
    };

    const _parseExistingRyhmaRestriction = () => {
        const organisaatioViitteet = kayttooikeusryhma?.organisaatioViite || [];
        const organisaatioViiteRyhmaRestriction: boolean =
            organisaatioViitteet.length > 0
                ? organisaatioViitteet.some((organisaatioviite) => _isRyhmaOid(organisaatioviite.organisaatioTyyppi))
                : false;
        const ryhmaRestriction = kayttooikeusryhma?.ryhmaRestriction;
        return !!(organisaatioViiteRyhmaRestriction || ryhmaRestriction);
    };

    const _parseExistingKayttooikeusryhmaSelections = (): SelectOption[] => {
        return (
            kayttooikeusryhmaMyontoviite?.map((viite) => {
                const text = viite.nimi.texts?.find((text) => text.lang.toLowerCase() === locale);
                return {
                    value: viite.id.toString(),
                    label: text?.text ?? '',
                };
            }) ?? []
        );
    };

    const _parseExistingTextsData = (texts?: Text[]) => {
        const result = { FI: '', SV: '', EN: '' };
        if (texts === undefined) {
            return result;
        }
        texts.forEach((text: Text) => {
            result[text.lang] = text.text;
        });
        return result;
    };

    const _parseExistingOrganisaatioData = (): OrganisaatioSelectObject[] => {
        if (!organisations || organisations.length === 0 || !kayttooikeusryhma?.organisaatioViite) {
            return [];
        }
        const organisaatioViittees = kayttooikeusryhma.organisaatioViite.filter((organisaatioViite) =>
            _isOrganisaatioOid(organisaatioViite.organisaatioTyyppi)
        );
        const organisaatioOids = organisaatioViittees.map((organisaatioViite) => organisaatioViite.organisaatioTyyppi);
        return organisaatioOids
            .map((oid) => organisations.find((o) => o.oid === oid))
            .map((organisaatio) => {
                const localizedName = getLocalization(organisaatio?.nimi, locale);
                const name =
                    organisaatio?.status === 'AKTIIVINEN'
                        ? localizedName
                        : `${localizedName} (${L('KAYTTOOIKEUSRYHMAT_PASSIVOITU')})`;
                const orgData: OrganisaatioSelectObject = {
                    oid: organisaatio?.oid ?? '',
                    name,
                    parentNames: [],
                    organisaatiotyypit: [],
                    oidPath: undefined,
                    status: undefined,
                };
                return orgData;
            });
    };

    const _isOrganisaatioOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] === '10';
    };

    const _isRyhmaOid = (input: string): boolean => {
        return input.split('.')[4] !== undefined && input.split('.')[4] !== '10';
    };

    const _parseExistingOppilaitostyyppiData = (): string[] => {
        if (!kayttooikeusryhma?.organisaatioViite || !organisaatiotyyppiKoodisto) {
            return [];
        }
        const oppilaitostyypit = (oppilaitostyyppiKoodisto ?? []).map(
            (oppilaitostyyppiKoodi) => oppilaitostyyppiKoodi.koodiUri
        );
        const oppilaitosOrganisaatioViiteet = kayttooikeusryhma.organisaatioViite.filter((organisaatioViite) =>
            organisaatioViite.organisaatioTyyppi.startsWith('oppilaitostyyppi_')
        );
        const ids = oppilaitosOrganisaatioViiteet.map((item) => item.organisaatioTyyppi);
        return oppilaitostyypit.filter((oppilaitostyyppi) => ids.includes(oppilaitostyyppi));
    };

    const _parseExistingOrganisaatiotyyppiData = (): string[] => {
        if (!kayttooikeusryhma?.organisaatioViite || !organisaatiotyyppiKoodisto) {
            return [];
        }
        const organisaatiotyypit = (organisaatiotyyppiKoodisto ?? []).map(
            (organisaatiotyyppiKoodi) => organisaatiotyyppiKoodi.koodiUri
        );
        const organisaatiotyyppiOrganisaatioViiteet = kayttooikeusryhma.organisaatioViite.filter((organisaatioViite) =>
            organisaatioViite.organisaatioTyyppi.startsWith('organisaatiotyyppi_')
        );
        const ids = organisaatiotyyppiOrganisaatioViiteet.map((item) => item.organisaatioTyyppi);
        return organisaatiotyypit.filter((organisaatiotyyppi) => ids.includes(organisaatiotyyppi));
    };

    const _parseExistingPalvelutRoolitData = () => {
        return (
            palvelutRoolit?.map((palveluRooli) => {
                const matchLocale = (text: Text) => text.lang.toLowerCase() === locale;
                const palveluLabel = palveluRooli.palveluTexts?.find(matchLocale);
                const kayttooikeusLabel = palveluRooli.rooliTexts.find(matchLocale);
                return {
                    palvelu: {
                        value: palveluRooli.palveluName,
                        label: palveluLabel?.text ?? '',
                    },
                    kayttooikeus: {
                        value: palveluRooli.rooli,
                        label: kayttooikeusLabel?.text ?? '',
                    },
                };
            }) ?? []
        );
    };

    const _toggleRyhmaRestriction = () => {
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            ryhmaRestriction: !kayttooikeusryhmaForm.ryhmaRestriction,
        });
    };

    const _toggleSallittuKayttajatyyppiPalvelu = () => {
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            sallittuKayttajatyyppi: kayttooikeusryhmaForm.sallittuKayttajatyyppi === 'PALVELU' ? null : 'PALVELU',
        });
    };

    const _onOrganisaatioSelection = (selection: OrganisaatioSelectObject): void => {
        const currentOrganisaatioSelections = kayttooikeusryhmaForm.organisaatioSelections;
        if (!currentOrganisaatioSelections.some((organisaatio) => organisaatio.oid === selection.oid)) {
            setKayttooikeusryhmaForm({
                ...kayttooikeusryhmaForm,
                organisaatioSelections: [...currentOrganisaatioSelections, selection],
            });
        }
    };

    const _onRemoveOrganisaatioSelect = (selection: OrganisaatioSelectObject): void => {
        const newOrganisaatioSelections = kayttooikeusryhmaForm.organisaatioSelections.filter(
            (organisaatio) => selection.oid !== organisaatio.oid
        );
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            organisaatioSelections: newOrganisaatioSelections,
        });
    };

    const _onOppilaitostyypitSelection = (selection: React.ChangeEvent<HTMLInputElement>): void => {
        if (selection.target.checked) {
            const currentOppilaitostyypitSelections = kayttooikeusryhmaForm.oppilaitostyypitSelections;
            if (
                !currentOppilaitostyypitSelections.some(
                    (oppilaitostyyppi) => oppilaitostyyppi === selection.target.value
                )
            ) {
                setKayttooikeusryhmaForm({
                    ...kayttooikeusryhmaForm,
                    oppilaitostyypitSelections: [...currentOppilaitostyypitSelections, selection.target.value],
                });
            }
        } else {
            const newOppilaitostyypitSelections = kayttooikeusryhmaForm.oppilaitostyypitSelections.filter(
                (oppilaitostyyppi) => selection.target.value !== oppilaitostyyppi
            );
            setKayttooikeusryhmaForm({
                ...kayttooikeusryhmaForm,
                oppilaitostyypitSelections: newOppilaitostyypitSelections,
            });
        }
    };

    const _onOrganisaatiotyypitSelection = (selection: React.ChangeEvent<HTMLInputElement>): void => {
        if (selection.target.checked) {
            const currentOrganisaatiotyypitSelections = kayttooikeusryhmaForm.organisaatiotyypitSelections;
            if (
                !currentOrganisaatiotyypitSelections.some(
                    (organisaatiotyyppi) => organisaatiotyyppi === selection.target.value
                )
            ) {
                setKayttooikeusryhmaForm({
                    ...kayttooikeusryhmaForm,
                    organisaatiotyypitSelections: [...currentOrganisaatiotyypitSelections, selection.target.value],
                });
            }
        } else {
            const newOrganisaatiotyypitSelections = kayttooikeusryhmaForm.organisaatiotyypitSelections.filter(
                (organisaatiotyyppi) => selection.target.value !== organisaatiotyyppi
            );
            setKayttooikeusryhmaForm({
                ...kayttooikeusryhmaForm,
                organisaatiotyypitSelections: newOrganisaatiotyypitSelections,
            });
        }
    };

    const _setName = (languageCode: string, value: string): void => {
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            name: {
                ...kayttooikeusryhmaForm.name,
                [languageCode]: value,
            },
        });
    };

    const _setDescription = (languageCode: string, value: string): void => {
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            description: {
                ...kayttooikeusryhmaForm.description,
                [languageCode]: value,
            },
        });
    };

    const _onKayttooikeusryhmaSelection = (selection: SingleValue<SelectOption>): void => {
        if (!selection) {
            return;
        }
        const currentKayttooikeusryhmaSelections = kayttooikeusryhmaForm.kayttooikeusryhmaSelections;
        if (!currentKayttooikeusryhmaSelections.some((k) => k.value === selection.value)) {
            setKayttooikeusryhmaForm({
                ...kayttooikeusryhmaForm,
                kayttooikeusryhmaSelections: [...currentKayttooikeusryhmaSelections, selection],
            });
        }
    };

    const _onRemoveKayttooikeusryhmaSelect = (selection: SelectOption): void => {
        const newKayttooikeusryhmaSelections = kayttooikeusryhmaForm.kayttooikeusryhmaSelections.filter(
            (kayttooikeusryhma) => kayttooikeusryhma.value !== selection.value
        );
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            kayttooikeusryhmaSelections: newKayttooikeusryhmaSelections,
        });
    };

    const _onPalvelutSelection = (selection: SingleValue<SelectOption>): void => {
        setPalvelutSelection(selection);
        setPalveluKayttooikeusSelection(null);
    };

    const _onLisaaPalveluJaKayttooikeus = (): void => {
        const newKayttoikeusSelection = {
            palvelu: palvelutSelection,
            kayttooikeus: palveluKayttooikeusSelection,
        };
        const currentKayttooikeusSelections = kayttooikeusryhmaForm.palveluJaKayttooikeusSelections;
        if (
            !currentKayttooikeusSelections.some(
                (k) =>
                    k.palvelu?.value === newKayttoikeusSelection.palvelu?.value &&
                    k.kayttooikeus?.value === newKayttoikeusSelection.kayttooikeus?.value
            )
        ) {
            setKayttooikeusryhmaForm({
                ...kayttooikeusryhmaForm,
                palveluJaKayttooikeusSelections: [...currentKayttooikeusSelections, newKayttoikeusSelection],
            });
            setPalveluKayttooikeusSelection(null);
        }
    };

    const _onRemovePalveluJaKayttooikeus = (removeItem: PalveluJaKayttooikeusSelection): void => {
        const newPalveluJaKayttooikeusSelections = kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.filter(
            (currentItem) =>
                !(
                    removeItem.kayttooikeus?.value === currentItem.kayttooikeus?.value &&
                    removeItem.palvelu?.value === currentItem.palvelu?.value
                )
        );
        setKayttooikeusryhmaForm({
            ...kayttooikeusryhmaForm,
            palveluJaKayttooikeusSelections: newPalveluJaKayttooikeusSelections,
        });
    };

    const _validateKayttooikeusryhmaInputs = (): boolean => {
        return (
            _validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections() &&
            _validateKayttooikeusryhmaDescriptions() &&
            _validateKayttooikeusryhmaNimet()
        );
    };

    const _validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections = (): boolean => {
        return kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.length > 0;
    };

    const _validateKayttooikeusryhmaDescriptions = (): boolean => {
        const description = kayttooikeusryhmaForm.description;
        return description.FI.length > 0 && description.SV.length > 0;
    };

    const _validateKayttooikeusryhmaNimet = (): boolean => {
        const name = kayttooikeusryhmaForm.name;
        return name.FI.length > 0 && name.SV.length > 0 && name.EN.length > 0;
    };

    const _parseNameData = (): TextGroupModify => {
        const name = kayttooikeusryhmaForm.name;
        const texts: Text[] = Object.keys(name).map((key) => ({
            lang: key as Locales,
            text: name[key as Locales],
        }));
        return { texts };
    };

    const _parseDescriptionData = (): TextGroupModify => {
        const description = kayttooikeusryhmaForm.description;
        const texts: Text[] = Object.keys(description).map((key) => ({
            lang: key as Locales,
            text: description[key as Locales],
        }));
        return { texts };
    };

    const _parsePalvelutRoolit = (): PalveluRooliModify[] => {
        return kayttooikeusryhmaForm.palveluJaKayttooikeusSelections.map((item) => ({
            palveluName: item.palvelu?.value ?? '',
            rooli: item.kayttooikeus?.value ?? '',
        }));
    };

    const _parseOrganisaatioTyypit = (): string[] => {
        const oppilaitostyypit = kayttooikeusryhmaForm.oppilaitostyypitSelections;
        const organisaatiotyypit = kayttooikeusryhmaForm.organisaatiotyypitSelections;
        const tyypit = oppilaitostyypit.concat(organisaatiotyypit);
        const organisaatiot = kayttooikeusryhmaForm.organisaatioSelections.map((item) => item.oid);
        const ryhmaRestrictionviite = ryhmaRestrictionViite ? [ryhmaRestrictionViite.organisaatioTyyppi] : [];
        return ryhmaRestrictionViite
            ? tyypit.concat(organisaatiot).concat(ryhmaRestrictionviite)
            : tyypit.concat(organisaatiot);
    };

    const _hasPassiveOrganisaatioRajoite = (): boolean => {
        const passivoitu = L('KAYTTOOIKEUSRYHMAT_PASSIVOITU');
        const organisaatioSelections = kayttooikeusryhmaForm.organisaatioSelections;
        return !!organisaatioSelections?.some((selection) => selection.name.includes(passivoitu));
    };

    const parsePayload = (): KayttooikeusryhmaRequest => ({
        nimi: _parseNameData(),
        kuvaus: _parseDescriptionData(),
        palvelutRoolit: _parsePalvelutRoolit(),
        rooliRajoite: null,
        ryhmaRestriction: kayttooikeusryhmaForm.ryhmaRestriction,
        organisaatioTyypit: _parseOrganisaatioTyypit(),
        slaveIds: kayttooikeusryhmaForm.kayttooikeusryhmaSelections.map((selection) => parseInt(selection.value, 10)),
        sallittuKayttajatyyppi: kayttooikeusryhmaForm.sallittuKayttajatyyppi,
    });

    async function createNewKayttooikeusryhma() {
        setToggleTallenna(true);
        await postKayttooikeusryhma(parsePayload())
            .unwrap()
            .then(() => {
                navigate('/kayttooikeusryhmat');
            })
            .catch((error) => {
                dispatch(
                    add({
                        id: `create-kayttooikeusryhma-${Math.random()}`,
                        type: 'error',
                        header: L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'),
                    })
                );
                throw error;
            });
    }

    async function updateKayttooikeusryhma() {
        setToggleTallenna(true);
        await putKayttooikeusryhma({ id: props.kayttooikeusryhmaId, body: parsePayload() })
            .unwrap()
            .then(() => {
                navigate('/kayttooikeusryhmat');
            })
            .catch((error) => {
                dispatch(
                    add({
                        id: `update-kayttooikeusryhma-${props.kayttooikeusryhmaId}-${Math.random()}`,
                        type: 'error',
                        header: L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'),
                    })
                );
                throw error;
            });
    }

    function getStatusString() {
        return isPassivoitu ? ` (${L('KAYTTOOIKEUSRYHMAT_PASSIVOITU')})` : '';
    }

    function renderKayttooikeusryhmaMuokattu() {
        if (kayttooikeusryhma) {
            const muokattu = kayttooikeusryhma.muokattu
                ? format(parseISO(kayttooikeusryhma.muokattu), 'd.M.yyyy H:mm')
                : null;
            const muokkaaja = kayttooikeusryhma.muokkaaja ? kayttooikeusryhma.muokkaaja : null;
            if (muokattu && muokkaaja) {
                return `${muokattu} (${muokkaaja})`;
            }
            return L('EI_TIEDOSSA');
        }
        return '';
    }

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold kayttooikeusryhma-header">
                {L('KAYTTOOIKEUSRYHMAT_OTSIKKO') + getStatusString()}
            </span>
            <KayttooikeusryhmatNimi name={kayttooikeusryhmaForm.name} setName={_setName} />

            <KayttooikeusryhmatKuvaus
                description={kayttooikeusryhmaForm.description}
                setDescription={_setDescription}
            />

            <KayttooikeusryhmatSallittuKayttajatyyppi
                kayttajaTyyppi={kayttooikeusryhmaForm.sallittuKayttajatyyppi}
                setSallittuKayttajatyyppi={_toggleSallittuKayttajatyyppiPalvelu}
            />

            <KayttooikeusryhmanOrganisaatiorajoite
                ryhmaRestriction={kayttooikeusryhmaForm.ryhmaRestriction}
                toggleRyhmaRestriction={_toggleRyhmaRestriction}
                organisaatioSelectAction={_onOrganisaatioSelection}
                organisaatioSelections={kayttooikeusryhmaForm.organisaatioSelections}
                removeOrganisaatioSelectAction={_onRemoveOrganisaatioSelect}
                oppilaitostyypitSelectAction={_onOppilaitostyypitSelection}
                oppilaitostyypitSelections={kayttooikeusryhmaForm.oppilaitostyypitSelections}
                organisaatiotyypitSelectAction={_onOrganisaatiotyypitSelection}
                organisaatiotyypitSelections={kayttooikeusryhmaForm.organisaatiotyypitSelections}
            />

            <MyonnettavatKayttooikeusryhmat
                kayttooikeusryhmaSelectAction={_onKayttooikeusryhmaSelection}
                kayttooikeusryhmaSelections={kayttooikeusryhmaForm.kayttooikeusryhmaSelections}
                removeKayttooikeusryhmaSelectAction={_onRemoveKayttooikeusryhmaSelect}
            />

            <KayttooikeusryhmatPalvelutJaKayttooikeudet
                palvelutSelection={palvelutSelection}
                palvelutSelectAction={_onPalvelutSelection}
                palveluKayttooikeusSelectAction={setPalveluKayttooikeusSelection}
                palveluKayttooikeusSelection={palveluKayttooikeusSelection}
                lisaaPalveluJaKayttooikeusAction={_onLisaaPalveluJaKayttooikeus}
                palveluJaKayttooikeusSelections={kayttooikeusryhmaForm.palveluJaKayttooikeusSelections}
                removePalveluJaKayttooikeus={_onRemovePalveluJaKayttooikeus}
            />

            <div className="kayttooikeusryhmat-lisaa-page-buttons">
                <button
                    disabled={!_validateKayttooikeusryhmaInputs()}
                    className="oph-button oph-button-primary"
                    onClick={() => {
                        return props.kayttooikeusryhmaId ? updateKayttooikeusryhma() : createNewKayttooikeusryhma();
                    }}
                >
                    <SpinnerInButton show={toggleTallenna}></SpinnerInButton> {L('TALLENNA')}
                </button>
                <button
                    className="oph-button oph-button-cancel"
                    onClick={() => {
                        navigate('/kayttooikeusryhmat');
                    }}
                >
                    {L('PERUUTA')}
                </button>
                <ToggleKayttooikeusryhmaStateModal kayttooikeusryhmaId={props.kayttooikeusryhmaId} />
                <span>
                    {L('MUOKATTU')}: {renderKayttooikeusryhmaMuokattu()}
                </span>
            </div>

            <LocalNotification
                toggle={!_validateKayttooikeusryhmaInputs()}
                type={'info'}
                title={L('KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVA_TIETO_OTSIKKO')}
            >
                <ul>
                    {_validateKayttooikeusryhmaNimet() ? null : (
                        <li>{L('KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_NIMI')}</li>
                    )}
                    {_validateKayttooikeusryhmaDescriptions() ? null : (
                        <li>{L('KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_KUVAUS')}</li>
                    )}
                    {_validateKayttooikeusryhmaPalveluKayttooikeusryhmaSelections() ? null : (
                        <li>{L('KAYTTOOIKEUSRYHMAT_LISAA_PUUTTUVAT_TIETO_PALVELUKAYTTOOIKEUS')}</li>
                    )}
                </ul>
            </LocalNotification>

            <LocalNotification
                toggle={_hasPassiveOrganisaatioRajoite.call(this)}
                type="warning"
                title={L('KAYTTOOIKEUSRYHMAT_PASSIVOITU_VAROITUS')}
            />
        </div>
    );
};
