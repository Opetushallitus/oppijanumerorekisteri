import './CKKohde.css';
import React from 'react';
import RyhmaSelection from '../../select/RyhmaSelection';
import { OrganisaatioSelectModal } from '../../select/OrganisaatioSelectModal';
import { Localisations } from '../../../../types/localisation.type';
import { Locale } from '../../../../types/locale.type';

type Props = {
    organisationAction: (arg0: any) => void;
    organisationValue: string;
    L: Localisations;
    locale: Locale;
    selection: string;
};

const CKKohde = ({ organisationAction, organisationValue, L, locale, selection }: Props) => (
    <tr key="kayttokohdeField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</span>:
        </td>
        <td>
            <div className="kohdeOrganisaatio flex-horizontal">
                <input
                    className="oph-input flex-item-1 kutsutut-organisaatiosuodatus"
                    type="text"
                    value={selection}
                    placeholder={L['OMATTIEDOT_VALITSE_ORGANISAATIO']}
                    readOnly
                />
                <OrganisaatioSelectModal L={L} locale={locale} onSelect={organisationAction}></OrganisaatioSelectModal>
            </div>

            <div className="kohdeRyhma">
                <RyhmaSelection selectOrganisaatio={organisationAction} selectedOrganisaatioOid={organisationValue} />
            </div>
        </td>
        <td>
            <span className="oph-bold">{' ' + L['HENKILO_LISAA_KAYTTOOIKEUDET_TAI']}</span>
        </td>
    </tr>
);

export default CKKohde;
