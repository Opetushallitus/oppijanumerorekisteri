// @flow
import React from 'react'
import KayttooikeusryhmaSelectModal from '../../select/KayttooikeusryhmaSelectModal'
import { toLocalizedText } from '../../../../localizabletext'
import { myonnettyToKayttooikeusryhma } from '../../../../utils/KayttooikeusryhmaUtils'
import type { MyonnettyKayttooikeusryhma } from '../../../../types/domain/kayttooikeus/kayttooikeusryhma.types'
import type { L } from '../../../../types/localisation.type'
import type { Locale } from '../../../../types/locale.type'

export type ValittuKayttooikeusryhma = {
    value: number,
    label: string,
}

type Props = {
    kayttooikeusData: Array<MyonnettyKayttooikeusryhma>,
    selectedList: Array<ValittuKayttooikeusryhma>,
    kayttooikeusAction: (ValittuKayttooikeusryhma) => void,
    close: (kayttooikeusryhmaId: number) => void,
    L: L,
    locale: Locale,
}

const CKKayttooikeudet = ({kayttooikeusData, selectedList, kayttooikeusAction, close, L, locale}: Props) => {
    const kayttooikeusryhmat = kayttooikeusData && kayttooikeusData
        .filter(myonnetty => selectedList.every(selected => selected.value !== myonnetty.ryhmaId))
        .map(myonnettyToKayttooikeusryhma)
    return <tr key="kayttooikeusKayttooikeudetField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</span>:
        </td>
        <td>
            <div>
                <div>
                    <KayttooikeusryhmaSelectModal
                        locale={locale}
                        L={L}
                        kayttooikeusryhmat={kayttooikeusryhmat}
                        onSelect={(kayttooikeusryhma) => kayttooikeusAction({
                            value: kayttooikeusryhma.id,
                            label: toLocalizedText(locale, kayttooikeusryhma.nimi)
                        })}
                        disabled={kayttooikeusData === undefined}
                        />
                </div>
            </div>
            <div>
                {
                    selectedList.map((selected, idx) =>
                        <div key={idx} className="oph-alert oph-alert-info">
                            <div className="oph-alert-container">
                                <div className="oph-alert-title">{selected.label}</div>
                                <button className="oph-button oph-button-close"
                                        type="button"
                                        title={L['POISTA']}
                                        aria-label="Close" onClick={() => close(selected.value)}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        </div>)
                }
            </div>
        </td>
        <td />
    </tr>;
};

export default CKKayttooikeudet;
