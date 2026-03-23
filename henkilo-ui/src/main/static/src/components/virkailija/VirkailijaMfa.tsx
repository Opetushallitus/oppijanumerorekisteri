import React, { useId } from 'react';

import { useGetKayttajatiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';

import styles from '../omattiedot/Mfa.module.css';

type MfaProps = {
    henkiloOid: string;
};

export const VirkailijaMfa = ({ henkiloOid }: MfaProps) => {
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(henkiloOid);
    const { L } = useLocalisations();
    const mfaSectionLabelId = useId();

    return (
        <section aria-labelledby={mfaSectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={mfaSectionLabelId}>{L('TIETOTURVA_ASETUKSET_OTSIKKO')}</h2>
            <div className={styles.infoTitle}>
                <span className={styles.mfaTitle}>{L('MFA_TUNNISTAUTUMINEN')}</span>
                <span className={styles.mfaEnabled} data-test-id="mfa-status">
                    {kayttajatiedot?.mfaProvider ? L('MFA_KAYTOSSA') : L('MFA_EI_KAYTOSSA')}
                </span>
            </div>
        </section>
    );
};
