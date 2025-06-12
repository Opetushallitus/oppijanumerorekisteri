import React from 'react';
import { useSelector } from 'react-redux';

import KayttooikeusryhmaSelectModal from '../../select/KayttooikeusryhmaSelectModal';
import { toLocalizedText } from '../../../../localizabletext';
import { myonnettyToKayttooikeusryhma } from '../../../../utils/KayttooikeusryhmaUtils';
import { useGetAllowedKayttooikeusryhmasForOrganisationQuery } from '../../../../api/kayttooikeus';
import { RootState } from '../../../../store';
import { useLocalisations } from '../../../../selectors';

export type ValittuKayttooikeusryhma = {
    value: number;
    label: string;
};

type Props = {
    selectedList: Array<ValittuKayttooikeusryhma>;
    kayttooikeusAction: (arg0: ValittuKayttooikeusryhma) => void;
    close: (kayttooikeusryhmaId: number) => void;
    selectedOrganisationOid: string;
    isPalvelukayttaja: boolean;
};

const CKKayttooikeudet = ({
    selectedList,
    kayttooikeusAction,
    close,
    selectedOrganisationOid,
    isPalvelukayttaja,
}: Props) => {
    const { L, locale } = useLocalisations();
    const oidHenkilo = useSelector<RootState, string>((state) => state.omattiedot?.data.oid);
    const { data, isLoading } = useGetAllowedKayttooikeusryhmasForOrganisationQuery(
        { oidHenkilo, oidOrganisaatio: selectedOrganisationOid },
        {
            skip: !oidHenkilo || !selectedOrganisationOid,
        }
    );
    const kayttooikeusryhmat =
        data
            ?.filter((myonnetty) => selectedList.every((selected) => selected.value !== myonnetty.ryhmaId))
            .map(myonnettyToKayttooikeusryhma) ?? [];
    return (
        <tr key="kayttooikeusKayttooikeudetField">
            <td>
                <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</span>:
            </td>
            <td>
                <div>
                    <div>
                        <KayttooikeusryhmaSelectModal
                            kayttooikeusryhmat={kayttooikeusryhmat}
                            kayttooikeusryhmaValittu={selectedList.length > 0}
                            onSelect={(kayttooikeusryhma) =>
                                kayttooikeusAction({
                                    value: kayttooikeusryhma.id,
                                    label: toLocalizedText(locale, kayttooikeusryhma.nimi),
                                })
                            }
                            loading={isLoading}
                            isOrganisaatioSelected={!!selectedOrganisationOid}
                            sallittuKayttajatyyppi={isPalvelukayttaja ? 'PALVELU' : 'VIRKAILIJA'}
                        />
                    </div>
                </div>
                <div>
                    {selectedList.map((selected, idx) => (
                        <div key={idx} className="oph-alert oph-alert-info">
                            <div className="oph-alert-container">
                                <div className="oph-alert-title">{selected.label}</div>
                                <button
                                    className="oph-button oph-button-close"
                                    type="button"
                                    title={L['POISTA']}
                                    aria-label="Close"
                                    onClick={() => close(selected.value)}
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </td>
            <td />
        </tr>
    );
};

export default CKKayttooikeudet;
