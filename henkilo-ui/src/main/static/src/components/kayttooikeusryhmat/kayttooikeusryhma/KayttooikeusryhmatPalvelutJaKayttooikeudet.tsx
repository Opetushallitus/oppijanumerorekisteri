import React, { useEffect, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';

import { PalveluJaKayttooikeusSelection } from './KayttooikeusryhmaPage';
import PalveluJaKayttooikeusSelections from './PalveluJaKayttooikeusSelections';
import { useLocalisations } from '../../../selectors';
import { useGetPalveluKayttooikeudetQuery, useGetPalvelutQuery } from '../../../api/kayttooikeus';

import './KayttooikeusryhmatPalvelutJaKayttooikeudet.css';
import { SelectOption } from '../../../utilities/select';

type Props = {
    palvelutSelectAction: (selection: SingleValue<SelectOption>) => void;
    palvelutSelection: SingleValue<SelectOption>;
    palveluKayttooikeusSelectAction: (selection: SingleValue<SelectOption>) => void;
    palveluKayttooikeusSelection: SingleValue<SelectOption>;
    lisaaPalveluJaKayttooikeusAction: () => void;
    palveluJaKayttooikeusSelections: PalveluJaKayttooikeusSelection[];
    removePalveluJaKayttooikeus: (arg0: PalveluJaKayttooikeusSelection) => void;
};

const KayttooikeusryhmatPalvelutJaKayttooikeudet = (props: Props) => {
    const { L, locale } = useLocalisations();
    const { data: palvelut } = useGetPalvelutQuery();
    const value = props.palvelutSelection?.value;
    const { data: palveluKayttooikeudet } = useGetPalveluKayttooikeudetQuery(value!, {
        skip: !props.palvelutSelection?.value,
    });
    const [palveluKayttooikeusOptions, setPalveluKayttooikeusOptions] = useState<SelectOption[]>([]);
    const palvelutOptions = useMemo(
        () =>
            palvelut?.map((palvelu) => ({
                label: palvelu.description.texts?.find((t) => t.lang === locale.toUpperCase())?.text ?? '',
                value: palvelu.name,
            })) ?? [],
        [palvelut]
    );

    useEffect(() => {
        setPalveluKayttooikeusOptions(
            palveluKayttooikeudet?.map((palveluKayttooikeus) => ({
                label: palveluKayttooikeus.oikeusLangs.find((o) => o.lang === locale.toLocaleUpperCase())?.text ?? '',
                value: palveluKayttooikeus.rooli,
            })) ?? []
        );
    }, [palveluKayttooikeudet]);

    return (
        <div className="kayttooikeusryhmat-palvelu-ja-kayttooikeudet">
            <h4>{L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELUT_JA_OIKEUDET']} *</h4>
            <div className="flex-horizontal">
                <div className="flex-item-1">
                    <Select
                        id="kayttooikeusryhmat-palvelut"
                        options={palvelutOptions}
                        value={props.palvelutSelection}
                        placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_PALVELU']}
                        onChange={props.palvelutSelectAction}
                    />
                </div>

                <div className="flex-item-1 kayttooikeudet-wrapper">
                    <div className="flex-inline">
                        <div className="flex-item-1">
                            <Select
                                id="kayttooikeusryhmat-palvelu-kayttooikeudet"
                                options={palveluKayttooikeusOptions}
                                isDisabled={!props.palvelutSelection}
                                value={props.palveluKayttooikeusSelection}
                                placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUS']}
                                onChange={props.palveluKayttooikeusSelectAction}
                            />
                        </div>
                        <button
                            className="oph-button add-button oph-button-primary"
                            disabled={
                                props.palvelutSelection === undefined ||
                                props.palveluKayttooikeusSelection === undefined
                            }
                            onClick={() => props.lisaaPalveluJaKayttooikeusAction()}
                        >
                            {L['LISAA']}
                        </button>
                    </div>
                </div>
            </div>
            <PalveluJaKayttooikeusSelections
                items={props.palveluJaKayttooikeusSelections}
                removeAction={props.removePalveluJaKayttooikeus}
                L={L}
            ></PalveluJaKayttooikeusSelections>
        </div>
    );
};

export default KayttooikeusryhmatPalvelutJaKayttooikeudet;
