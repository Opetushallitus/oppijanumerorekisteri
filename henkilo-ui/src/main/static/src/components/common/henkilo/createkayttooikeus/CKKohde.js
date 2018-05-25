import './CKKohde.css'
import React from 'react'
import PropTypes from 'prop-types'
import RyhmaSelection from "../../select/RyhmaSelection";
import {OrganisaatioSelectModal} from "../../select/OrganisaatioSelectModal";
import {
    omattiedotOrganisaatiotToOrganisaatioSelectObject,
} from "../../../../utilities/organisaatio.util";

const CKKohde = ({organisationData, organisationAction, organisationValue, L, locale, selection}) =>
     <tr key="kayttokohdeField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</span>:
        </td>
        <td>
            <div className="kohdeOrganisaatio flex-horizontal">
                <input className="oph-input flex-item-1 kutsutut-organisaatiosuodatus" type="text"
                       value={selection}
                       placeholder={L['OMATTIEDOT_VALITSE_ORGANISAATIO']} readOnly/>
                <OrganisaatioSelectModal L={L}
                                         organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(organisationData, locale)}
                                         locale={locale}
                                         disabled={organisationData.length === 0}
                                         onSelect={organisationAction}>
                </OrganisaatioSelectModal>
            </div>

            <div className="kohdeRyhma">
                <RyhmaSelection L={L}
                                organisaatios={organisationData}
                                selectOrganisaatio={organisationAction}
                                selectedOrganisaatioOid={organisationValue}
                                locale={locale}
                />
            </div>
        </td>
        <td>
            <span className="oph-bold">{' ' + L['HENKILO_LISAA_KAYTTOOIKEUDET_TAI']}</span>
        </td>
    </tr>;



CKKohde.propTypes = {
    organisationData: PropTypes.array,
    L: PropTypes.object,
    organisationAction: PropTypes.func,
    organisationValue: PropTypes.string,
    locale: PropTypes.string,
};

export default CKKohde;