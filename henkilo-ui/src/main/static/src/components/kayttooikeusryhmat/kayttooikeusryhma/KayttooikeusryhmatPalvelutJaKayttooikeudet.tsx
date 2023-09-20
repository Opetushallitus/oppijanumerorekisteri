import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './KayttooikeusryhmatPalvelutJaKayttooikeudet.css';
import OphSelect from '../../common/select/OphSelect';
import type { Option, Options } from 'react-select';
import { PalvelutState } from '../../../reducers/palvelut.reducer';
import { KayttooikeusState } from '../../../reducers/kayttooikeus.reducer';
import { PalveluJaKayttooikeusSelection } from './KayttooikeusryhmaPage';
import PalveluJaKayttooikeusSelections from './PalveluJaKayttooikeusSelections';
import { useLocalisations } from '../../../selectors';
import { RootState } from '../../../store';

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
    const palvelutState = useSelector<RootState, PalvelutState>((state) => state.palvelutState);
    const kayttooikeusState = useSelector<RootState, KayttooikeusState>((state) => state.kayttooikeusState);
    const [palveluKayttooikeusOptions, setPalveluKayttooikeusOptions] = useState<Options<string>>([]);
    const palvelutOptions: Options<string> = palvelutState.palvelut.map((palvelu) => {
        const textObject = palvelu.description.texts?.find((t) => t.lang === locale.toUpperCase());
        return {
            label: textObject?.text,
            value: palvelu.name,
        };
    });

    useEffect(() => {
        setPalveluKayttooikeusOptions(
            kayttooikeusState.palveluKayttooikeus.map((palveluKayttooikeus) => {
                const textObject = palveluKayttooikeus.oikeusLangs.find((o) => o.lang === locale.toLocaleUpperCase());
                return {
                    label: textObject?.text,
                    value: palveluKayttooikeus.rooli,
                };
            })
        );
    }, [kayttooikeusState]);

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
