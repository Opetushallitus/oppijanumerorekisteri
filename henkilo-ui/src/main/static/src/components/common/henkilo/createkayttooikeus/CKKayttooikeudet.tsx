import React from 'react';

import KayttooikeusryhmaSelectModal from '../../select/KayttooikeusryhmaSelectModal';
import { toLocalizedText } from '../../../../localizabletext';
import { myonnettyToKayttooikeusryhma } from '../../../../utils/KayttooikeusryhmaUtils';
import {
    useGetAllowedKayttooikeusryhmasForOrganisationQuery,
    useGetOmattiedotQuery,
} from '../../../../api/kayttooikeus';
import { useLocalisations } from '../../../../selectors';

export type ValittuKayttooikeusryhma = {
    value: number;
    label: string;
};

type Props = {
    selectedList: Array<ValittuKayttooikeusryhma>;
    addKayttooikeus: (arg0: ValittuKayttooikeusryhma) => void;
    removeKayttooikeus: (kayttooikeusryhmaId: number) => void;
    selectedOrganisationOid: string;
    isPalvelukayttaja: boolean;
};

const CKKayttooikeudet = ({
    selectedList,
    addKayttooikeus,
    removeKayttooikeus,
    selectedOrganisationOid,
    isPalvelukayttaja,
}: Props) => {
    const { L, locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data, isLoading } = useGetAllowedKayttooikeusryhmasForOrganisationQuery(
        { oidHenkilo: omattiedot.oidHenkilo, oidOrganisaatio: selectedOrganisationOid },
        {
            skip: !omattiedot || !selectedOrganisationOid,
        }
    );
    const kayttooikeusryhmat =
        data
            ?.filter((myonnetty) => selectedList.every((selected) => selected.value !== myonnetty.ryhmaId))
            .map(myonnettyToKayttooikeusryhma) ?? [];
    return (
        <div>
            <div>
                <KayttooikeusryhmaSelectModal
                    kayttooikeusryhmat={kayttooikeusryhmat}
                    kayttooikeusryhmaValittu={selectedList.length > 0}
                    onSelect={(kayttooikeusryhma) =>
                        addKayttooikeus({
                            value: kayttooikeusryhma.id,
                            label: toLocalizedText(locale, kayttooikeusryhma.nimi),
                        })
                    }
                    loading={isLoading}
                    isOrganisaatioSelected={!!selectedOrganisationOid}
                    sallittuKayttajatyyppi={isPalvelukayttaja ? 'PALVELU' : 'VIRKAILIJA'}
                    disabled={!selectedOrganisationOid}
                />
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
                                disabled={!selectedOrganisationOid}
                                onClick={() => removeKayttooikeus(selected.value)}
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CKKayttooikeudet;
