import React, { useEffect, useMemo, useState } from 'react';
import './KayttooikeusryhmatPalvelutJaKayttooikeudet.css';
import OphSelect from '../../common/select/OphSelect';
import type { Option, Options } from 'react-select';
import { PalveluJaKayttooikeusSelection } from './KayttooikeusryhmaPage';
import PalveluJaKayttooikeusSelections from './PalveluJaKayttooikeusSelections';
import { useLocalisations } from '../../../selectors';
import { useGetPalveluKayttooikeudetQuery, useGetPalvelutQuery } from '../../../api/kayttooikeus';

type Props = {
    palvelutSelectAction: (selection: Option<string>) => void;
    palvelutSelection: Option<string>;
    palveluKayttooikeusSelectAction: (selection: Option<string>) => void;
    palveluKayttooikeusSelection: Option<string>;
    lisaaPalveluJaKayttooikeusAction: () => void;
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>;
    removePalveluJaKayttooikeus: (arg0: PalveluJaKayttooikeusSelection) => void;
};

const KayttooikeusryhmatPalvelutJaKayttooikeudet = (props: Props) => {
    const { L, locale } = useLocalisations();
    const { data: palvelut } = useGetPalvelutQuery();
    const { data: palveluKayttooikeudet } = useGetPalveluKayttooikeudetQuery(props.palvelutSelection?.value, {
        skip: !props.palvelutSelection?.value,
    });
    const [palveluKayttooikeusOptions, setPalveluKayttooikeusOptions] = useState<Options<string>>([]);
    const palvelutOptions: Options<string> = useMemo(
        () =>
            palvelut?.map((palvelu) => ({
                label: palvelu.description.texts?.find((t) => t.lang === locale.toUpperCase())?.text,
                value: palvelu.name,
            })) ?? [],
        [palvelut]
    );

    useEffect(() => {
        setPalveluKayttooikeusOptions(
            palveluKayttooikeudet?.map((palveluKayttooikeus) => ({
                label: palveluKayttooikeus.oikeusLangs.find((o) => o.lang === locale.toLocaleUpperCase())?.text,
                value: palveluKayttooikeus.rooli,
            })) ?? []
        );
    }, [palveluKayttooikeudet]);

    return (
        <div className="kayttooikeusryhmat-palvelu-ja-kayttooikeudet">
            <h4>{L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELUT_JA_OIKEUDET']} *</h4>
            <div className="flex-horizontal">
                <div className="flex-item-1">
                    <OphSelect
                        id="kayttooikeusryhmat-palvelut"
                        options={palvelutOptions}
                        value={props.palvelutSelection?.value}
                        placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_PALVELU']}
                        onChange={props.palvelutSelectAction}
                    ></OphSelect>
                </div>

                <div className="flex-item-1 kayttooikeudet-wrapper">
                    <div className="flex-inline">
                        <div className="flex-item-1">
                            <OphSelect
                                id="kayttooikeusryhmat-palvelu-kayttooikeudet"
                                options={palveluKayttooikeusOptions}
                                disabled={!props.palvelutSelection}
                                value={props.palveluKayttooikeusSelection?.value}
                                placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUS']}
                                onChange={props.palveluKayttooikeusSelectAction}
                            ></OphSelect>
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
