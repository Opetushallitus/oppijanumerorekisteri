// @flow
import React from 'react'
import KayttooikeusryhmaSelectModal from '../../select/KayttooikeusryhmaSelectModal'
import { toLocalizedText } from '../../../../localizabletext'
import { myonnettyToKayttooikeusryhma } from '../../../../utils/KayttooikeusryhmaUtils'
import type { Localisations } from '../../../../types/localisation.type'
import type { Locale } from '../../../../types/locale.type'
import type {AllowedKayttooikeus} from "../../../../reducers/kayttooikeusryhma.reducer";

export type ValittuKayttooikeusryhma = {
    value: number,
    label: string,
}

type Props = {
    kayttooikeusData: ?AllowedKayttooikeus,
    selectedList: Array<ValittuKayttooikeusryhma>,
    kayttooikeusAction: (ValittuKayttooikeusryhma) => void,
    close: (kayttooikeusryhmaId: number) => void,
    L: Localisations,
    locale: Locale,
    loading: boolean,
    selectedOrganisationOid: string,
    isPalvelukayttaja: boolean,
}

const CKKayttooikeudet = ({kayttooikeusData, selectedList, kayttooikeusAction, close, L, locale, loading, selectedOrganisationOid, isPalvelukayttaja}: Props) => {
    const kayttooikeusryhmat = (kayttooikeusData && kayttooikeusData
        .filter(myonnetty => selectedList.every(selected => selected.value !== myonnetty.ryhmaId))
        .map(myonnettyToKayttooikeusryhma)) || [];
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
                        kayttooikeusryhmaValittu={selectedList.length > 0}
                        onSelect={(kayttooikeusryhma) => kayttooikeusAction({
                            value: kayttooikeusryhma.id,
                            label: toLocalizedText(locale, kayttooikeusryhma.nimi)
                        })}
                        loading={loading}
                        isOrganisaatioSelected={!!selectedOrganisationOid}
                        sallittuKayttajatyyppi={isPalvelukayttaja ? 'PALVELU' : 'VIRKAILIJA'}
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
